from typing import Annotated

from fastapi import APIRouter, Path, Query

from app.api.dependencias import Sesion
from app.core.seguridad import UsuarioActual
from app.schemas.horario import EntradaDiasSemana, EntradaTimbrado, EstadoHorario
from app.services import horario as servicio

enrutador = APIRouter(prefix="/schedule", tags=["horario"])

RutaIdTimbrado = Annotated[str, Path(min_length=1, max_length=40)]


@enrutador.get("", response_model=EstadoHorario)
async def obtener_horario(_: UsuarioActual, sesion: Sesion) -> EstadoHorario:
    return await servicio.cargar_estado(sesion)


@enrutador.put("/weekdays", response_model=EstadoHorario)
async def fijar_dias_semana(
    cuerpo: EntradaDiasSemana, _: UsuarioActual, sesion: Sesion
) -> EstadoHorario:
    await servicio.fijar_dias_semana(sesion, cuerpo.dias)
    return await servicio.cargar_estado(sesion)


@enrutador.put("/bells/{id_timbrado}", response_model=EstadoHorario)
async def guardar_timbrado(
    id_timbrado: RutaIdTimbrado,
    cuerpo: EntradaTimbrado,
    _: UsuarioActual,
    sesion: Sesion,
    alcance: Annotated[
        str, Query(alias="scope", description="`weekly` o `special:<id>`")
    ] = "weekly",
) -> EstadoHorario:
    id_especial = await servicio.resolver_alcance(sesion, alcance)
    await servicio.guardar_timbrado(sesion, id_especial, id_timbrado, cuerpo)
    return await servicio.cargar_estado(sesion)


@enrutador.delete("/bells/{id_timbrado}", response_model=EstadoHorario)
async def borrar_timbrado(
    id_timbrado: RutaIdTimbrado, _: UsuarioActual, sesion: Sesion
) -> EstadoHorario:
    await servicio.borrar_timbrado(sesion, id_timbrado)
    return await servicio.cargar_estado(sesion)
