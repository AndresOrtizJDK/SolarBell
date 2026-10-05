from datetime import date, datetime

from sqlalchemy import Date, DateTime, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, ListaEnteros


class EventoToque(Base):
    """Historial de toques. Un timbrado programado solo se registra una vez por día."""

    __tablename__ = "ring_events"
    __table_args__ = (UniqueConstraint("bell_id", "scheduled_for", name="uq_ring_bell_day"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    # `manual` | `scheduled`
    origen: Mapped[str] = mapped_column("source", String(10))
    # Sin FK: el timbrado puede borrarse y el historial queda.
    id_timbrado: Mapped[str | None] = mapped_column("bell_id", String(40), default=None)
    etiqueta: Mapped[str] = mapped_column("label", String(120), default="")
    programado_para: Mapped[date | None] = mapped_column("scheduled_for", Date, default=None)
    duraciones: Mapped[list[int]] = mapped_column("durations", ListaEnteros)
    pausa_ms: Mapped[int] = mapped_column("pause_ms")
    inicio: Mapped[datetime] = mapped_column("started_at", DateTime(timezone=True))
    fin: Mapped[datetime] = mapped_column("ends_at", DateTime(timezone=True))
    # `running` | `done` | `stopped`
    estado: Mapped[str] = mapped_column("status", String(10), default="running")
    entregado: Mapped[bool] = mapped_column("delivered", default=False)
