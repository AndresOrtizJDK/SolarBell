from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, ListaEnteros


class Timbrado(Base):
    __tablename__ = "bells"

    # El frontend genera el id al crear el timbrado (ver `frontend/src/lib/id.ts`).
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    id_fecha_especial: Mapped[str | None] = mapped_column(
        "special_date_id",
        ForeignKey("special_dates.id", ondelete="CASCADE"),
        index=True,
        default=None,
    )
    etiqueta: Mapped[str] = mapped_column("label", String(120), default="")
    hora: Mapped[str] = mapped_column("time", String(5))
    toques: Mapped[int] = mapped_column("rings")
    segundos_toque: Mapped[int] = mapped_column("ring_seconds")
    duraciones_personalizadas: Mapped[list[int] | None] = mapped_column(
        "custom_durations", ListaEnteros, default=None
    )
