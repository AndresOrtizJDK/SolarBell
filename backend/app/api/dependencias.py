from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.sesion import obtener_sesion

Sesion = Annotated[AsyncSession, Depends(obtener_sesion)]
