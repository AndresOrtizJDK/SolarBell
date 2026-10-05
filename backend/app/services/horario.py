import datetime as dt
from collections.abc import Sequence
from typing import Protocol

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.identificadores import nuevo_id
from app.models import FechaEspecial, HorarioSemanal, Timbrado
from app.schemas.horario import (
    CambioFechaEspecial,
    CrearFechaEspecial,
    EntradaTimbrado,
    EstadoHorario,
    SalidaFechaEspecial,
    SalidaSemanal,
    SalidaTimbrado,
)


def _no_existe(que: str) -> HTTPException:
    return HTTPException(status.HTTP_404_NOT_FOUND, f"{que} no existe")


def _fecha_ocupada() -> HTTPException:
    return HTTPException(status.HTTP_409_CONFLICT, "Ya hay una fecha especial ese día")


async def cargar_estado(sesion: AsyncSession) -> EstadoHorario:
    # Las mutaciones tocan `bells` directo: refrescar las relaciones ya cargadas.
    sesion.expire_all()
    semanal = await sesion.get(HorarioSemanal, 1)
    timbrados_semanales = await sesion.scalars(
        select(Timbrado).where(Timbrado.id_fecha_especial.is_(None)).order_by(Timbrado.hora)
    )
    especiales = await sesion.scalars(select(FechaEspecial).order_by(FechaEspecial.fecha))
    return EstadoHorario(
        semanal=SalidaSemanal(
            dias=sorted(semanal.dias) if semanal else [],
            timbrados=[SalidaTimbrado.model_validate(t) for t in timbrados_semanales],
        ),
        especiales=[SalidaFechaEspecial.model_validate(e) for e in especiales],
    )


async def resolver_alcance(sesion: AsyncSession, alcance: str) -> str | None:
    """`weekly` -> `None`; `special:<id>` -> id de la fecha especial."""
    if alcance == "weekly":
        return None
    tipo, _, id_especial = alcance.partition(":")
    if tipo != "special" or not id_especial:
        raise HTTPException(422, "scope inválido")
    if await sesion.get(FechaEspecial, id_especial) is None:
        raise _no_existe("La fecha especial")
    return id_especial


def _aplicar_timbrado(timbrado: Timbrado, datos: EntradaTimbrado) -> None:
    timbrado.etiqueta = datos.etiqueta
    timbrado.hora = datos.hora
    timbrado.toques = datos.toques
    timbrado.segundos_toque = datos.segundos_toque
    timbrado.duraciones_personalizadas = (
        list(datos.duraciones_personalizadas) if datos.duraciones_personalizadas else None
    )


def _nuevo_timbrado(
    datos: EntradaTimbrado, *, id_timbrado: str, id_especial: str | None
) -> Timbrado:
    timbrado = Timbrado(id=id_timbrado, id_fecha_especial=id_especial)
    _aplicar_timbrado(timbrado, datos)
    return timbrado


async def guardar_timbrado(
    sesion: AsyncSession, id_especial: str | None, id_timbrado: str, datos: EntradaTimbrado
) -> None:
    timbrado = await sesion.get(Timbrado, id_timbrado)
    if timbrado is None:
        sesion.add(_nuevo_timbrado(datos, id_timbrado=id_timbrado, id_especial=id_especial))
    elif timbrado.id_fecha_especial != id_especial:
        raise HTTPException(status.HTTP_409_CONFLICT, "El timbrado pertenece a otro horario")
    else:
        _aplicar_timbrado(timbrado, datos)
    await sesion.commit()


async def borrar_timbrado(sesion: AsyncSession, id_timbrado: str) -> None:
    await sesion.execute(delete(Timbrado).where(Timbrado.id == id_timbrado))
    await sesion.commit()


async def fijar_dias_semana(sesion: AsyncSession, dias: list[int]) -> None:
    semanal = await sesion.get(HorarioSemanal, 1)
    limpios = sorted(set(dias))
    if semanal is None:
        sesion.add(HorarioSemanal(id=1, dias=limpios))
    else:
        semanal.dias = limpios
    await sesion.commit()


async def _timbrados_semanales(sesion: AsyncSession) -> Sequence[Timbrado]:
    resultado = await sesion.scalars(select(Timbrado).where(Timbrado.id_fecha_especial.is_(None)))
    return resultado.all()


def _clonar(timbrados: Sequence[Timbrado], id_especial: str) -> list[Timbrado]:
    return [
        Timbrado(
            id=nuevo_id(),
            id_fecha_especial=id_especial,
            etiqueta=t.etiqueta,
            hora=t.hora,
            toques=t.toques,
            segundos_toque=t.segundos_toque,
            duraciones_personalizadas=(
                list(t.duraciones_personalizadas) if t.duraciones_personalizadas else None
            ),
        )
        for t in timbrados
    ]


async def _asegurar_fecha_libre(
    sesion: AsyncSession, dia: dt.date, excepto_id: str | None = None
) -> None:
    otra = await sesion.scalar(select(FechaEspecial).where(FechaEspecial.fecha == dia))
    if otra is not None and otra.id != excepto_id:
        raise _fecha_ocupada()


async def crear_especial(sesion: AsyncSession, datos: CrearFechaEspecial) -> str:
    await _asegurar_fecha_libre(sesion, datos.fecha)
    id_especial = datos.id or nuevo_id()
    if await sesion.get(FechaEspecial, id_especial) is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "El id ya existe")

    especial = FechaEspecial(
        id=id_especial, fecha=datos.fecha, nombre=datos.nombre.strip(), modo=datos.modo
    )
    sesion.add(especial)
    if datos.timbrados is not None:
        sesion.add_all(
            _nuevo_timbrado(t, id_timbrado=t.id, id_especial=id_especial)
            for t in datos.timbrados
        )
    elif datos.modo == "custom":
        sesion.add_all(_clonar(await _timbrados_semanales(sesion), id_especial))
    await sesion.commit()
    return id_especial


async def _obtener_especial(sesion: AsyncSession, id_especial: str) -> FechaEspecial:
    especial = await sesion.get(FechaEspecial, id_especial)
    if especial is None:
        raise _no_existe("La fecha especial")
    return especial


async def _reemplazar_timbrados(
    sesion: AsyncSession, id_especial: str, timbrados: list[Timbrado]
) -> None:
    await sesion.execute(delete(Timbrado).where(Timbrado.id_fecha_especial == id_especial))
    sesion.add_all(timbrados)


async def modificar_especial(
    sesion: AsyncSession, id_especial: str, cambio: CambioFechaEspecial
) -> None:
    especial = await _obtener_especial(sesion, id_especial)
    if cambio.fecha is not None and cambio.fecha != especial.fecha:
        await _asegurar_fecha_libre(sesion, cambio.fecha, excepto_id=id_especial)
        especial.fecha = cambio.fecha
    if cambio.nombre is not None:
        especial.nombre = cambio.nombre
    if cambio.modo is not None:
        especial.modo = cambio.modo
    if cambio.timbrados is not None:
        await _reemplazar_timbrados(
            sesion,
            id_especial,
            [
                _nuevo_timbrado(t, id_timbrado=t.id, id_especial=id_especial)
                for t in cambio.timbrados
            ],
        )
    await sesion.commit()


async def copiar_semanal_en(sesion: AsyncSession, id_especial: str) -> None:
    await _obtener_especial(sesion, id_especial)
    await _reemplazar_timbrados(
        sesion, id_especial, _clonar(await _timbrados_semanales(sesion), id_especial)
    )
    await sesion.commit()


async def borrar_especial(sesion: AsyncSession, id_especial: str) -> None:
    await sesion.execute(delete(Timbrado).where(Timbrado.id_fecha_especial == id_especial))
    await sesion.execute(delete(FechaEspecial).where(FechaEspecial.id == id_especial))
    await sesion.commit()


class _ConModo(Protocol):
    modo: str
    timbrados: Sequence[Timbrado]


def timbrados_del_dia(
    dia: dt.date,
    dias_semana: Sequence[int],
    timbrados_semanales: Sequence[Timbrado],
    especial: _ConModo | None,
) -> list[Timbrado]:
    """Misma regla que `dayPlan` en `frontend/src/features/schedule/upcoming.ts`."""
    if especial is not None:
        if especial.modo == "off":
            return []
        return sorted(especial.timbrados, key=lambda t: t.hora)
    # Python: lunes = 0. Frontend (`Date#getDay`): domingo = 0.
    if (dia.weekday() + 1) % 7 in dias_semana:
        return sorted(timbrados_semanales, key=lambda t: t.hora)
    return []


async def resolver_dia(sesion: AsyncSession, dia: dt.date) -> list[Timbrado]:
    semanal = await sesion.get(HorarioSemanal, 1)
    especial = await sesion.scalar(select(FechaEspecial).where(FechaEspecial.fecha == dia))
    return timbrados_del_dia(
        dia, semanal.dias if semanal else [], await _timbrados_semanales(sesion), especial
    )
