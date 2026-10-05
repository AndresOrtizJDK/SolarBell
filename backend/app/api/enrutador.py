from fastapi import APIRouter

from app.api.routes import autenticacion, fechas_especiales, horario, salud, toque

enrutador_api = APIRouter(prefix="/api")
enrutador_api.include_router(salud.enrutador)
enrutador_api.include_router(autenticacion.enrutador)
enrutador_api.include_router(horario.enrutador)
enrutador_api.include_router(fechas_especiales.enrutador)
enrutador_api.include_router(toque.enrutador)
