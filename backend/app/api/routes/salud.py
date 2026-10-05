from fastapi import APIRouter
from sqlalchemy import text

from app.api.dependencias import Sesion
from app.services.concentrador import concentrador

enrutador = APIRouter(tags=["salud"])


@enrutador.get("/health")
async def salud(sesion: Sesion) -> dict[str, object]:
    try:
        await sesion.execute(text("SELECT 1"))
        bd_ok = True
    except Exception:
        bd_ok = False
    return {
        "status": "ok" if bd_ok else "degraded",
        "db": bd_ok,
        "deviceOnline": concentrador.dispositivo_en_linea,
    }
