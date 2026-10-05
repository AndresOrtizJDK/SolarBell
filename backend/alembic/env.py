import asyncio
from logging.config import fileConfig

from alembic import context
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import create_async_engine

import app.models  # noqa: F401  registra las tablas en Base.metadata
from app.core.configuracion import configuracion
from app.db.base import Base

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

metadatos_objetivo = Base.metadata


def migrar_sin_conexion() -> None:
    context.configure(
        url=configuracion.url_base_datos,
        target_metadata=metadatos_objetivo,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def _ejecutar_migraciones(conexion: Connection) -> None:
    context.configure(connection=conexion, target_metadata=metadatos_objetivo)
    with context.begin_transaction():
        context.run_migrations()


async def migrar_con_conexion() -> None:
    motor = create_async_engine(configuracion.url_base_datos)
    async with motor.connect() as conexion:
        await conexion.run_sync(_ejecutar_migraciones)
    await motor.dispose()


if context.is_offline_mode():
    migrar_sin_conexion()
else:
    asyncio.run(migrar_con_conexion())
