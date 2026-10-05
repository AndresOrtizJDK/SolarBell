from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Dispositivo(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column("name", String(60))
    # sha256 de la clave API; la clave en claro solo vive en el `configuracion.h` del ESP32.
    hash_clave_api: Mapped[str] = mapped_column("api_key_hash", String(64), unique=True)
    visto_por_ultima_vez: Mapped[datetime | None] = mapped_column(
        "last_seen_at", DateTime(timezone=True), default=None
    )
