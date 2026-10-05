import hashlib
from datetime import UTC, datetime, timedelta
from typing import Annotated

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.configuracion import configuracion
from app.db.sesion import obtener_sesion
from app.models.usuario import Usuario

ALGORITMO = "HS256"

hasheador = PasswordHash.recommended()
portador = HTTPBearer(auto_error=False)


def hashear_contrasena(contrasena: str) -> str:
    return hasheador.hash(contrasena)


def verificar_contrasena(contrasena: str, hash_guardado: str) -> bool:
    return hasheador.verify(contrasena, hash_guardado)


def hashear_clave_api(clave: str) -> str:
    return hashlib.sha256(clave.encode()).hexdigest()


def crear_token_acceso(id_usuario: int) -> str:
    vence = datetime.now(UTC) + timedelta(minutes=configuracion.minutos_vigencia_jwt)
    return jwt.encode(
        {"sub": str(id_usuario), "exp": vence}, configuracion.secreto_jwt, ALGORITMO
    )


def decodificar_token_acceso(token: str) -> int | None:
    try:
        datos = jwt.decode(token, configuracion.secreto_jwt, algorithms=[ALGORITMO])
        return int(datos["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


def _no_autorizado() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesión inválida o vencida",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def obtener_usuario_actual(
    credenciales: Annotated[HTTPAuthorizationCredentials | None, Depends(portador)],
    sesion: Annotated[AsyncSession, Depends(obtener_sesion)],
) -> Usuario:
    if credenciales is None:
        raise _no_autorizado()
    id_usuario = decodificar_token_acceso(credenciales.credentials)
    usuario = await sesion.get(Usuario, id_usuario) if id_usuario is not None else None
    if usuario is None:
        raise _no_autorizado()
    return usuario


UsuarioActual = Annotated[Usuario, Depends(obtener_usuario_actual)]
