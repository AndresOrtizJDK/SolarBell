from functools import cached_property
from zoneinfo import ZoneInfo

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Configuracion(BaseSettings):
    """Cada campo se lee de la variable de entorno de su `alias` (p. ej. `DATABASE_URL`)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    url_base_datos: str = Field(
        "postgresql+asyncpg://solarbell:solarbell@localhost:5432/solarbell", alias="DATABASE_URL"
    )

    secreto_jwt: str = Field("dev-only-secret-change-me-in-production-0000", alias="JWT_SECRET")
    minutos_vigencia_jwt: int = Field(60 * 24 * 30, alias="JWT_EXPIRE_MINUTES")

    # Zona horaria del sitio de la campana: los `HH:MM` del horario son hora local de ahí.
    zona_horaria: str = Field("America/Bogota", alias="TZ")

    origenes_cors: list[str] = Field(["http://localhost:5173"], alias="CORS_ORIGINS")

    correo_admin: str = Field("admin@solarbell.local", alias="ADMIN_EMAIL")
    contrasena_admin: str = Field("solarbell", alias="ADMIN_PASSWORD")
    nombre_admin: str = Field("Admin", alias="ADMIN_NAME")

    nombre_dispositivo: str = Field("Campana", alias="DEVICE_NAME")
    clave_api_dispositivo: str = Field("dev-device-key", alias="DEVICE_API_KEY")

    # Pausa entre toques consecutivos. El producto todavía no la define (PRODUCT.md).
    pausa_toque_ms: int = Field(1000, alias="RING_PAUSE_MS")

    programador_activo: bool = Field(True, alias="SCHEDULER_ENABLED")
    sembrar_al_iniciar: bool = Field(True, alias="SEED_ON_STARTUP")

    @cached_property
    def zona(self) -> ZoneInfo:
        return ZoneInfo(self.zona_horaria)


configuracion = Configuracion()
