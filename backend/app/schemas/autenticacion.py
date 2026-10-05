from pydantic import Field, field_validator

from app.schemas.comun import EsquemaBase


class EntradaLogin(EsquemaBase):
    correo: str = Field(min_length=3, max_length=254, alias="email")
    contrasena: str = Field(min_length=1, max_length=256, alias="password")

    @field_validator("correo")
    @classmethod
    def _normalizar(cls, valor: str) -> str:
        return valor.strip().lower()


class SalidaUsuario(EsquemaBase):
    id: int
    correo: str = Field(alias="email")
    nombre: str = Field(alias="name")


class CambioUsuario(EsquemaBase):
    nombre: str = Field(min_length=1, max_length=60, alias="name")

    @field_validator("nombre")
    @classmethod
    def _recortar(cls, valor: str) -> str:
        valor = valor.strip()
        if not valor:
            raise ValueError("El nombre no puede estar vacío")
        return valor


class SalidaToken(EsquemaBase):
    token_acceso: str = Field(alias="accessToken")
    tipo_token: str = Field("bearer", alias="tokenType")
    usuario: SalidaUsuario = Field(alias="user")
