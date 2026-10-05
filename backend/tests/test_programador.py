import datetime as dt

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.configuracion import configuracion
from app.models import EventoToque, FechaEspecial
from app.services.horario import resolver_dia
from app.services.programador import revisar_minuto
from app.services.toque import gestor_toques

LUNES = dt.date(2026, 10, 5)
SABADO = dt.date(2026, 10, 10)


def a_las(dia: dt.date, hhmm: str) -> dt.datetime:
    h, m = map(int, hhmm.split(":"))
    return dt.datetime.combine(dia, dt.time(h, m, 5), tzinfo=configuracion.zona)


async def test_dia_habil_usa_el_horario_semanal(sesion: AsyncSession) -> None:
    horas = [t.hora for t in await resolver_dia(sesion, LUNES)]
    assert horas == ["08:00", "10:00", "12:00"]


async def test_dia_inactivo_no_tiene_timbrados(sesion: AsyncSession) -> None:
    assert await resolver_dia(sesion, SABADO) == []


async def test_especial_off_y_custom_reemplazan_el_semanal(sesion: AsyncSession) -> None:
    sesion.add(FechaEspecial(id="off", fecha=LUNES, nombre="Festivo", modo="off"))
    sesion.add(FechaEspecial(id="sat", fecha=SABADO, nombre="Feria", modo="custom"))
    await sesion.commit()
    assert await resolver_dia(sesion, LUNES) == []
    assert await resolver_dia(sesion, SABADO) == []


async def test_revisar_minuto_dispara_una_vez_por_dia(sesion: AsyncSession) -> None:
    disparados = await revisar_minuto(a_las(LUNES, "08:00"))
    assert len(disparados) == 1
    assert gestor_toques.en_curso is not None
    assert gestor_toques.en_curso.origen == "scheduled"

    assert await revisar_minuto(a_las(LUNES, "08:00")) == []
    assert await revisar_minuto(a_las(LUNES, "08:01")) == []

    eventos = (await sesion.scalars(select(EventoToque))).all()
    assert len(eventos) == 1
    assert eventos[0].programado_para == LUNES


async def test_revisar_minuto_salta_dia_inactivo(sesion: AsyncSession) -> None:
    assert await revisar_minuto(a_las(SABADO, "08:00")) == []
