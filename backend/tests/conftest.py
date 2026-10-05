from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.core.configuracion import configuracion
from app.db import sesion as bd
from app.db.base import Base
from app.principal import app
from app.semilla import sembrar
from app.services.toque import gestor_toques


@pytest.fixture
async def fabrica(monkeypatch: pytest.MonkeyPatch) -> AsyncIterator[async_sessionmaker]:
    motor = create_async_engine(
        "sqlite+aiosqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with motor.begin() as conexion:
        await conexion.run_sync(Base.metadata.create_all)
    fabrica = async_sessionmaker(motor, expire_on_commit=False)
    monkeypatch.setattr(bd, "FabricaSesion", fabrica)
    async with fabrica() as sesion:
        await sembrar(sesion)
    yield fabrica
    await gestor_toques.apagar()
    await motor.dispose()


@pytest.fixture
async def sesion(fabrica: async_sessionmaker) -> AsyncIterator[AsyncSession]:
    async with fabrica() as s:
        yield s


@pytest.fixture
async def cliente(fabrica: async_sessionmaker) -> AsyncIterator[AsyncClient]:
    async def reemplazo() -> AsyncIterator[AsyncSession]:
        async with fabrica() as s:
            yield s

    app.dependency_overrides[bd.obtener_sesion] = reemplazo
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
async def auth(cliente: AsyncClient) -> dict[str, str]:
    respuesta = await cliente.post(
        "/api/auth/login",
        json={"email": configuracion.correo_admin, "password": configuracion.contrasena_admin},
    )
    assert respuesta.status_code == 200, respuesta.text
    return {"Authorization": f"Bearer {respuesta.json()['accessToken']}"}
