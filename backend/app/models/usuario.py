from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Usuario(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    correo: Mapped[str] = mapped_column("email", String(254), unique=True, index=True)
    nombre: Mapped[str] = mapped_column("name", String(60))
    hash_contrasena: Mapped[str] = mapped_column("password_hash", String(255))
    creado: Mapped[datetime] = mapped_column(
        "created_at", DateTime(timezone=True), server_default=func.now()
    )
