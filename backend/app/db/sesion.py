from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.configuracion import configuracion

motor = create_async_engine(configuracion.url_base_datos, pool_pre_ping=True)
FabricaSesion = async_sessionmaker(motor, expire_on_commit=False)


async def obtener_sesion() -> AsyncIterator[AsyncSession]:
    async with FabricaSesion() as sesion:
        yield sesion
