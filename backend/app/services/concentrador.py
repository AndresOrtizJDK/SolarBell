import logging
from typing import Any

from fastapi import WebSocket

log = logging.getLogger(__name__)


class Concentrador:
    """Conexiones WebSocket vivas: nodos ESP32 y apps abiertas. Vive en memoria (1 worker)."""

    def __init__(self) -> None:
        self.dispositivos: dict[int, WebSocket] = {}
        self.apps: set[WebSocket] = set()

    @property
    def dispositivo_en_linea(self) -> bool:
        return bool(self.dispositivos)

    def estado_dispositivo(self) -> dict[str, Any]:
        return {"type": "device_status", "online": self.dispositivo_en_linea}

    async def agregar_dispositivo(self, id_dispositivo: int, ws: WebSocket) -> None:
        anterior = self.dispositivos.get(id_dispositivo)
        self.dispositivos[id_dispositivo] = ws
        if anterior is not None:
            # El ESP32 se reconectó sin cerrar la conexión vieja.
            try:
                await anterior.close()
            except RuntimeError:
                pass
        await self.difundir_apps(self.estado_dispositivo())

    async def quitar_dispositivo(self, id_dispositivo: int, ws: WebSocket) -> None:
        if self.dispositivos.get(id_dispositivo) is ws:
            del self.dispositivos[id_dispositivo]
            await self.difundir_apps(self.estado_dispositivo())

    async def enviar_dispositivos(self, mensaje: dict[str, Any]) -> bool:
        entregado = False
        for id_dispositivo, ws in list(self.dispositivos.items()):
            try:
                await ws.send_json(mensaje)
                entregado = True
            except Exception:
                log.warning("dispositivo %s no respondió; se descarta", id_dispositivo)
                self.dispositivos.pop(id_dispositivo, None)
        return entregado

    def agregar_app(self, ws: WebSocket) -> None:
        self.apps.add(ws)

    def quitar_app(self, ws: WebSocket) -> None:
        self.apps.discard(ws)

    async def difundir_apps(self, mensaje: dict[str, Any]) -> None:
        for ws in list(self.apps):
            try:
                await ws.send_json(mensaje)
            except Exception:
                self.apps.discard(ws)


concentrador = Concentrador()
