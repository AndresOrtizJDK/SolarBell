from fastapi import APIRouter, status

from app.api.dependencias import Sesion
from app.core.seguridad import UsuarioActual
from app.schemas.horario import CambioFechaEspecial, CrearFechaEspecial, EstadoHorario
from app.services import horario as servicio

enrutador = APIRouter(prefix="/specials", tags=["fechas especiales"])


@enrutador.post("", response_model=EstadoHorario, status_code=status.HTTP_201_CREATED)
async def crear_especial(
    cuerpo: CrearFechaEspecial, _: UsuarioActual, sesion: Sesion
) -> EstadoHorario:
    await servicio.crear_especial(sesion, cuerpo)
    return await servicio.cargar_estado(sesion)


@enrutador.patch("/{id_especial}", response_model=EstadoHorario)
async def modificar_especial(
    id_especial: str, cuerpo: CambioFechaEspecial, _: UsuarioActual, sesion: Sesion
) -> EstadoHorario:
    await servicio.modificar_especial(sesion, id_especial, cuerpo)
    return await servicio.cargar_estado(sesion)


@enrutador.post("/{id_especial}/copy-weekly", response_model=EstadoHorario)
async def copiar_semanal(id_especial: str, _: UsuarioActual, sesion: Sesion) -> EstadoHorario:
    await servicio.copiar_semanal_en(sesion, id_especial)
    return await servicio.cargar_estado(sesion)


@enrutador.delete("/{id_especial}", response_model=EstadoHorario)
async def borrar_especial(id_especial: str, _: UsuarioActual, sesion: Sesion) -> EstadoHorario:
    await servicio.borrar_especial(sesion, id_especial)
    return await servicio.cargar_estado(sesion)
