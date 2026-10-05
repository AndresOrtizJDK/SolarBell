import datetime as dt
from typing import Annotated, Literal

from pydantic import Field, model_validator

from app.schemas.comun import EsquemaBase

# Mismos límites que `frontend/src/features/schedule/bell.ts`.
TOQUES_MIN, TOQUES_MAX = 1, 10
SEGUNDOS_MIN, SEGUNDOS_MAX = 1, 30

Segundos = Annotated[int, Field(ge=SEGUNDOS_MIN, le=SEGUNDOS_MAX)]
DiaSemana = Annotated[int, Field(ge=0, le=6)]
IdTimbrado = Annotated[str, Field(min_length=1, max_length=40)]
ModoEspecial = Literal["custom", "off"]


class ConfigToque(EsquemaBase):
    toques: int = Field(ge=TOQUES_MIN, le=TOQUES_MAX, alias="rings")
    segundos_toque: Segundos = Field(alias="ringSeconds")
    duraciones_personalizadas: list[Segundos] | None = Field(None, alias="customDurations")

    @model_validator(mode="after")
    def _duraciones_coinciden_con_toques(self):
        if (
            self.duraciones_personalizadas is not None
            and len(self.duraciones_personalizadas) != self.toques
        ):
            raise ValueError("customDurations debe tener un valor por toque")
        return self

    def duraciones(self) -> list[int]:
        return self.duraciones_personalizadas or [self.segundos_toque] * self.toques


class EntradaTimbrado(ConfigToque):
    etiqueta: str = Field("", max_length=120, alias="label")
    hora: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$", alias="time")


class SalidaTimbrado(EntradaTimbrado):
    id: IdTimbrado


class SalidaSemanal(EsquemaBase):
    dias: list[int] = Field(alias="days")
    timbrados: list[SalidaTimbrado] = Field(alias="bells")


class SalidaFechaEspecial(EsquemaBase):
    id: str
    fecha: dt.date = Field(alias="date")
    nombre: str = Field(alias="name")
    modo: ModoEspecial = Field(alias="mode")
    timbrados: list[SalidaTimbrado] = Field(alias="bells")


class EstadoHorario(EsquemaBase):
    semanal: SalidaSemanal = Field(alias="weekly")
    especiales: list[SalidaFechaEspecial] = Field(alias="specials")


class EntradaDiasSemana(EsquemaBase):
    dias: list[DiaSemana] = Field(alias="days")


class CrearFechaEspecial(EsquemaBase):
    id: IdTimbrado | None = None
    fecha: dt.date = Field(alias="date")
    nombre: str = Field("", max_length=120, alias="name")
    modo: ModoEspecial = Field(alias="mode")
    # Sin `bells` y en modo `custom`, el servidor copia el horario semanal.
    timbrados: list[SalidaTimbrado] | None = Field(None, alias="bells")


class CambioFechaEspecial(EsquemaBase):
    fecha: dt.date | None = Field(None, alias="date")
    nombre: str | None = Field(None, max_length=120, alias="name")
    modo: ModoEspecial | None = Field(None, alias="mode")
    timbrados: list[SalidaTimbrado] | None = Field(None, alias="bells")
