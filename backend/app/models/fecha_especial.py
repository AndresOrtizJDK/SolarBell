import datetime as dt

from sqlalchemy import Date, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.timbrado import Timbrado


class FechaEspecial(Base):
    __tablename__ = "special_dates"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    fecha: Mapped[dt.date] = mapped_column("date", Date, unique=True)
    nombre: Mapped[str] = mapped_column("name", String(120), default="")
    # `custom`: horario propio ese día. `off`: sin timbrado.
    modo: Mapped[str] = mapped_column("mode", String(10))

    timbrados: Mapped[list[Timbrado]] = relationship(
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by=Timbrado.hora,
        lazy="selectin",
    )
