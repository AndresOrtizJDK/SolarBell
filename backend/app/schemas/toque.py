from typing import Literal

from pydantic import Field

from app.schemas.comun import EsquemaBase


class SalidaToqueEnCurso(EsquemaBase):
    """Toque en curso. Tiempos en ms epoch, como `Date.now()` en el frontend."""

    id: int
    origen: Literal["manual", "scheduled"] = Field(alias="source")
    etiqueta: str = Field(alias="label")
    duraciones: list[int] = Field(alias="durations")
    pausa_ms: int = Field(alias="pauseMs")
    inicio: int = Field(alias="startedAt")
    fin: int = Field(alias="endsAt")
    entregado: bool = Field(alias="delivered")


class SalidaEstadoToque(EsquemaBase):
    en_curso: SalidaToqueEnCurso | None = Field(alias="run")
    dispositivo_en_linea: bool = Field(alias="deviceOnline")
