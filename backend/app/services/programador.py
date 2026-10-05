import asyncio
import datetime as dt
import logging

from sqlalchemy.exc import IntegrityError

from app.core.configuracion import configuracion
from app.db import sesion as bd
from app.schemas.horario import ConfigToque
from app.services.horario import resolver_dia
from app.services.toque import gestor_toques

log = logging.getLogger(__name__)


async def revisar_minuto(ahora: dt.datetime) -> list[str]:
    """Dispara los timbrados de `ahora` (hora local del sitio). Devuelve los ids que sonaron."""
    dia = ahora.date()
    minuto = ahora.strftime("%H:%M")
    disparados: list[str] = []
    async with bd.FabricaSesion() as sesion:
        pendientes = [t for t in await resolver_dia(sesion, dia) if t.hora == minuto]
        for timbrado in pendientes:
            try:
                await gestor_toques.iniciar(
                    sesion,
                    ConfigToque.model_validate(timbrado),
                    origen="scheduled",
                    etiqueta=timbrado.etiqueta,
                    id_timbrado=timbrado.id,
                    programado_para=dia,
                )
            except IntegrityError:
                # Ya sonó hoy (p. ej. el servidor reinició dentro del mismo minuto).
                await sesion.rollback()
                continue
            disparados.append(timbrado.id)
            log.info("timbrado %s (%s) disparado", timbrado.etiqueta or timbrado.id, minuto)
    return disparados


async def ejecutar_programador() -> None:
    ultimo_minuto: dt.datetime | None = None
    while True:
        ahora = dt.datetime.now(configuracion.zona)
        minuto = ahora.replace(second=0, microsecond=0)
        if minuto != ultimo_minuto:
            ultimo_minuto = minuto
            try:
                await revisar_minuto(ahora)
            except Exception:
                log.exception("programador: fallo al resolver %s", minuto)
        await asyncio.sleep(60 - ahora.second - ahora.microsecond / 1_000_000 + 0.2)
