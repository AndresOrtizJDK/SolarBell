import datetime as dt
import json
import logging

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import select

from app.core.configuracion import configuracion
from app.core.seguridad import decodificar_token_acceso, hashear_clave_api
from app.db import sesion as bd
from app.models import Dispositivo, Usuario
from app.services.concentrador import concentrador
from app.services.toque import gestor_toques

log = logging.getLogger(__name__)

enrutador = APIRouter()

# Códigos de cierre de aplicación (4000-4999).
CIERRE_NO_AUTORIZADO = 4401


async def _marcar_visto(id_dispositivo: int) -> None:
    async with bd.FabricaSesion() as sesion:
        dispositivo = await sesion.get(Dispositivo, id_dispositivo)
        if dispositivo is not None:
            dispositivo.visto_por_ultima_vez = dt.datetime.now(dt.UTC)
            await sesion.commit()


@enrutador.websocket("/ws/device")
async def socket_dispositivo(ws: WebSocket, clave: str = Query("", alias="key")) -> None:
    async with bd.FabricaSesion() as sesion:
        dispositivo = await sesion.scalar(
            select(Dispositivo).where(Dispositivo.hash_clave_api == hashear_clave_api(clave))
        )
    if dispositivo is None:
        await ws.close(code=CIERRE_NO_AUTORIZADO)
        return

    await ws.accept()
    await concentrador.agregar_dispositivo(dispositivo.id, ws)
    await _marcar_visto(dispositivo.id)
    log.info("nodo %s conectado", dispositivo.nombre)
    await ws.send_json({"type": "welcome", "pauseMs": configuracion.pausa_toque_ms})
    try:
        while True:
            crudo = await ws.receive_text()
            try:
                mensaje = json.loads(crudo)
            except ValueError:
                continue
            log.info("nodo %s: %s", dispositivo.nombre, mensaje)
            await _marcar_visto(dispositivo.id)
    except WebSocketDisconnect:
        pass
    finally:
        await concentrador.quitar_dispositivo(dispositivo.id, ws)
        log.info("nodo %s desconectado", dispositivo.nombre)


@enrutador.websocket("/ws/app")
async def socket_app(ws: WebSocket, token: str = Query("")) -> None:
    id_usuario = decodificar_token_acceso(token)
    async with bd.FabricaSesion() as sesion:
        usuario = await sesion.get(Usuario, id_usuario) if id_usuario is not None else None
    if usuario is None:
        await ws.close(code=CIERRE_NO_AUTORIZADO)
        return

    await ws.accept()
    concentrador.agregar_app(ws)
    try:
        await ws.send_json(gestor_toques.mensaje_estado())
        await ws.send_json(concentrador.estado_dispositivo())
        while True:
            # La app no manda nada; leer mantiene viva la conexión y detecta el cierre.
            await ws.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        concentrador.quitar_app(ws)
