from fastapi import APIRouter

from app.api.dependencias import Sesion
from app.core.seguridad import UsuarioActual
from app.schemas.horario import ConfigToque
from app.schemas.toque import SalidaEstadoToque
from app.services.toque import gestor_toques

enrutador = APIRouter(prefix="/ring", tags=["toque"])


@enrutador.get("", response_model=SalidaEstadoToque)
async def obtener_toque(_: UsuarioActual) -> SalidaEstadoToque:
    return gestor_toques.estado()


@enrutador.post("", response_model=SalidaEstadoToque)
async def iniciar_toque(
    cuerpo: ConfigToque, _: UsuarioActual, sesion: Sesion
) -> SalidaEstadoToque:
    await gestor_toques.iniciar(sesion, cuerpo, origen="manual", etiqueta="Toque manual")
    return gestor_toques.estado()


@enrutador.post("/stop", response_model=SalidaEstadoToque)
async def detener_toque(_: UsuarioActual) -> SalidaEstadoToque:
    await gestor_toques.detener()
    return gestor_toques.estado()
