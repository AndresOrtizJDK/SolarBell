"""Datos base idempotentes: admin, horario semanal por defecto y el dispositivo del ESP32.

Uso manual: `uv run python -m app.semilla`.
"""

import asyncio
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.configuracion import configuracion
from app.core.identificadores import nuevo_id
from app.core.seguridad import hashear_clave_api, hashear_contrasena
from app.db import sesion as bd
from app.models import Dispositivo, HorarioSemanal, Timbrado, Usuario

log = logging.getLogger(__name__)

# Igual que el `seed()` original de `frontend/src/features/schedule/store.ts`.
DIAS_POR_DEFECTO = [1, 2, 3, 4, 5]
TIMBRADOS_POR_DEFECTO = [
    ("Primera hora", "08:00"),
    ("Segunda hora", "10:00"),
    ("Tercera hora", "12:00"),
]


async def sembrar(sesion: AsyncSession) -> None:
    correo = configuracion.correo_admin.strip().lower()
    if await sesion.scalar(select(Usuario).where(Usuario.correo == correo)) is None:
        sesion.add(
            Usuario(
                correo=correo,
                nombre=configuracion.nombre_admin,
                hash_contrasena=hashear_contrasena(configuracion.contrasena_admin),
            )
        )
        log.info("semilla: admin %s creado", correo)

    if await sesion.get(HorarioSemanal, 1) is None:
        sesion.add(HorarioSemanal(id=1, dias=DIAS_POR_DEFECTO))
        sesion.add_all(
            Timbrado(id=nuevo_id(), etiqueta=etiqueta, hora=hora, toques=3, segundos_toque=3)
            for etiqueta, hora in TIMBRADOS_POR_DEFECTO
        )
        log.info("semilla: horario semanal por defecto")

    hash_clave = hashear_clave_api(configuracion.clave_api_dispositivo)
    if (
        await sesion.scalar(select(Dispositivo).where(Dispositivo.hash_clave_api == hash_clave))
        is None
    ):
        sesion.add(Dispositivo(nombre=configuracion.nombre_dispositivo, hash_clave_api=hash_clave))
        log.info("semilla: dispositivo %s registrado", configuracion.nombre_dispositivo)

    await sesion.commit()


async def _principal() -> None:
    logging.basicConfig(level=logging.INFO)
    async with bd.FabricaSesion() as sesion:
        await sembrar(sesion)
    await bd.motor.dispose()


if __name__ == "__main__":
    asyncio.run(_principal())
