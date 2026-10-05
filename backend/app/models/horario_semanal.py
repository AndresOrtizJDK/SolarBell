from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, ListaEnteros


class HorarioSemanal(Base):
    """Fila única (`id = 1`). Los timbrados semanales son los `Timbrado` sin fecha especial."""

    __tablename__ = "weekly_schedule"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    # `Date#getDay()` del frontend: 0 = domingo … 6 = sábado.
    dias: Mapped[list[int]] = mapped_column("days", ListaEnteros)
