from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.dependencias import Sesion
from app.core.seguridad import UsuarioActual, crear_token_acceso, verificar_contrasena
from app.models import Usuario
from app.schemas.autenticacion import (
    CambioUsuario,
    EntradaLogin,
    SalidaToken,
    SalidaUsuario,
)

enrutador = APIRouter(prefix="/auth", tags=["autenticación"])


@enrutador.post("/login", response_model=SalidaToken)
async def iniciar_sesion(cuerpo: EntradaLogin, sesion: Sesion) -> SalidaToken:
    usuario = await sesion.scalar(select(Usuario).where(Usuario.correo == cuerpo.correo))
    if usuario is None or not verificar_contrasena(cuerpo.contrasena, usuario.hash_contrasena):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Correo o contraseña incorrectos")
    return SalidaToken(
        token_acceso=crear_token_acceso(usuario.id),
        usuario=SalidaUsuario.model_validate(usuario),
    )


@enrutador.get("/me", response_model=SalidaUsuario)
async def yo(usuario: UsuarioActual) -> Usuario:
    return usuario


@enrutador.patch("/me", response_model=SalidaUsuario)
async def actualizar_yo(cuerpo: CambioUsuario, usuario: UsuarioActual, sesion: Sesion) -> Usuario:
    # `obtener_usuario_actual` comparte la misma sesión de la request.
    usuario.nombre = cuerpo.nombre
    await sesion.commit()
    return usuario
