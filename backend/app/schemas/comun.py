from pydantic import BaseModel, ConfigDict


class EsquemaBase(BaseModel):
    """El `alias` de cada campo es la clave JSON en camelCase de los tipos del frontend."""

    model_config = ConfigDict(
        validate_by_name=True,
        validate_by_alias=True,
        serialize_by_alias=True,
        from_attributes=True,
    )
