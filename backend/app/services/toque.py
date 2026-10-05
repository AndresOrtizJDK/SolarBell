import asyncio
import datetime as dt
import logging
from contextlib import suppress
from typing import Any, Literal

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.configuracion import configuracion
from app.db import sesion as bd
from app.models import EventoToque
from app.schemas.horario import ConfigToque
from app.schemas.toque import SalidaEstadoToque, SalidaToqueEnCurso
from app.services.concentrador import concentrador

log = logging.getLogger(__name__)


def _ms(momento: dt.datetime) -> int:
    return int(momento.timestamp() * 1000)


def duracion_total_ms(duraciones: list[int], pausa_ms: int) -> int:
    return sum(duraciones) * 1000 + pausa_ms * max(len(duraciones) - 1, 0)


class GestorToques:
    """Un solo toque a la vez. El servidor lleva el tiempo; el ESP32 solo ejecuta."""

    def __init__(self) -> None:
        self.en_curso: SalidaToqueEnCurso | None = None
        self._temporizador: asyncio.Task[None] | None = None

    def estado(self) -> SalidaEstadoToque:
        return SalidaEstadoToque(
            en_curso=self.en_curso, dispositivo_en_linea=concentrador.dispositivo_en_linea
        )

    def mensaje_estado(self) -> dict[str, Any]:
        en_curso = self.en_curso.model_dump() if self.en_curso else None
        return {"type": "ring_state", "run": en_curso}

    async def iniciar(
        self,
        sesion: AsyncSession,
        config: ConfigToque,
        *,
        origen: Literal["manual", "scheduled"],
        etiqueta: str = "",
        id_timbrado: str | None = None,
        programado_para: dt.date | None = None,
    ) -> SalidaToqueEnCurso:
        """Para un timbrado ya registrado ese día lanza `IntegrityError` antes de tocar nada."""
        duraciones = config.duraciones()
        pausa_ms = configuracion.pausa_toque_ms
        total_ms = duracion_total_ms(duraciones, pausa_ms)
        inicio = dt.datetime.now(dt.UTC)
        evento = EventoToque(
            origen=origen,
            id_timbrado=id_timbrado,
            etiqueta=etiqueta,
            programado_para=programado_para,
            duraciones=duraciones,
            pausa_ms=pausa_ms,
            inicio=inicio,
            fin=inicio + dt.timedelta(milliseconds=total_ms),
        )
        sesion.add(evento)
        await sesion.flush()

        if self.en_curso is not None:
            await self._terminar(
                self.en_curso.id, "stopped", avisar_dispositivo=False, sesion=sesion
            )

        entregado = await concentrador.enviar_dispositivos(
            {"type": "ring", "id": evento.id, "durations": duraciones, "pauseMs": pausa_ms}
        )
        evento.entregado = entregado
        await sesion.commit()
        if not entregado:
            log.warning("toque %s sin nodo conectado: solo se registra", evento.id)

        toque = SalidaToqueEnCurso(
            id=evento.id,
            origen=origen,
            etiqueta=etiqueta,
            duraciones=duraciones,
            pausa_ms=pausa_ms,
            inicio=_ms(inicio),
            fin=_ms(evento.fin),
            entregado=entregado,
        )
        self.en_curso = toque
        self._temporizador = asyncio.create_task(self._vencer(toque.id, total_ms / 1000))
        await concentrador.difundir_apps(self.mensaje_estado())
        return toque

    async def detener(self) -> None:
        if self.en_curso is not None:
            await self._terminar(self.en_curso.id, "stopped", avisar_dispositivo=True)

    async def apagar(self) -> None:
        if self._temporizador is not None:
            self._temporizador.cancel()
            with suppress(asyncio.CancelledError):
                await self._temporizador
        self._temporizador = None
        self.en_curso = None

    async def _vencer(self, id_toque: int, segundos: float) -> None:
        await asyncio.sleep(segundos)
        await self._terminar(id_toque, "done", avisar_dispositivo=False)

    async def _terminar(
        self,
        id_toque: int,
        estado: str,
        *,
        avisar_dispositivo: bool,
        sesion: AsyncSession | None = None,
    ) -> None:
        """Con `sesion`, el cambio de estado queda en esa transacción (la confirma quien llama)."""
        if self.en_curso is None or self.en_curso.id != id_toque:
            return
        self.en_curso = None
        temporizador, self._temporizador = self._temporizador, None
        if temporizador is not None and temporizador is not asyncio.current_task():
            temporizador.cancel()

        if sesion is not None:
            evento = await sesion.get(EventoToque, id_toque)
            if evento is not None:
                evento.estado = estado
        else:
            async with bd.FabricaSesion() as propia:
                evento = await propia.get(EventoToque, id_toque)
                if evento is not None:
                    evento.estado = estado
                    await propia.commit()

        if avisar_dispositivo:
            await concentrador.enviar_dispositivos({"type": "stop", "id": id_toque})
        await concentrador.difundir_apps(self.mensaje_estado())


gestor_toques = GestorToques()
