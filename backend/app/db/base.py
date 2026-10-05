from sqlalchemy import JSON, Integer
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import DeclarativeBase

# `int[]` en PostgreSQL; JSON en SQLite para los tests.
ListaEnteros = JSON().with_variant(ARRAY(Integer), "postgresql")


class Base(DeclarativeBase):
    pass
