import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.enrutador import enrutador_api
from app.api.routes import websocket
from app.core.configuracion import configuracion
from app.db import sesion as bd
from app.semilla import sembrar
from app.services.programador import ejecutar_programador
from app.services.toque import gestor_toques

logging.basicConfig(level=logging.INFO, format="%(levelname)s [%(name)s] %(message)s")


@asynccontextmanager
async def ciclo_de_vida(_: FastAPI) -> AsyncIterator[None]:
    if configuracion.sembrar_al_iniciar:
        async with bd.FabricaSesion() as sesion:
            await sembrar(sesion)
    programador = (
        asyncio.create_task(ejecutar_programador()) if configuracion.programador_activo else None
    )
    yield
    if programador is not None:
        programador.cancel()
        with suppress(asyncio.CancelledError):
            await programador
    await gestor_toques.apagar()
    await bd.motor.dispose()


app = FastAPI(title="SolarBell API", version="0.1.0", lifespan=ciclo_de_vida)
app.add_middleware(
    CORSMiddleware,
    allow_origins=configuracion.origenes_cors,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(enrutador_api)
app.include_router(websocket.enrutador)
