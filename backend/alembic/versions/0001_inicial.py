"""esquema inicial

Revision ID: 0001
Revises:
Create Date: 2026-10-05
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ListaEnteros = postgresql.ARRAY(sa.Integer())


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("name", sa.String(60), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "weekly_schedule",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("days", ListaEnteros, nullable=False),
    )

    op.create_table(
        "special_dates",
        sa.Column("id", sa.String(40), primary_key=True),
        sa.Column("date", sa.Date(), nullable=False, unique=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("mode", sa.String(10), nullable=False),
    )

    op.create_table(
        "bells",
        sa.Column("id", sa.String(40), primary_key=True),
        sa.Column(
            "special_date_id",
            sa.String(40),
            sa.ForeignKey("special_dates.id", ondelete="CASCADE"),
            nullable=True,
        ),
        sa.Column("label", sa.String(120), nullable=False),
        sa.Column("time", sa.String(5), nullable=False),
        sa.Column("rings", sa.Integer(), nullable=False),
        sa.Column("ring_seconds", sa.Integer(), nullable=False),
        sa.Column("custom_durations", ListaEnteros, nullable=True),
    )
    op.create_index("ix_bells_special_date_id", "bells", ["special_date_id"])

    op.create_table(
        "devices",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(60), nullable=False),
        sa.Column("api_key_hash", sa.String(64), nullable=False, unique=True),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "ring_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("source", sa.String(10), nullable=False),
        sa.Column("bell_id", sa.String(40), nullable=True),
        sa.Column("label", sa.String(120), nullable=False),
        sa.Column("scheduled_for", sa.Date(), nullable=True),
        sa.Column("durations", ListaEnteros, nullable=False),
        sa.Column("pause_ms", sa.Integer(), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(10), nullable=False),
        sa.Column("delivered", sa.Boolean(), nullable=False),
        sa.UniqueConstraint("bell_id", "scheduled_for", name="uq_ring_bell_day"),
    )


def downgrade() -> None:
    op.drop_table("ring_events")
    op.drop_table("devices")
    op.drop_index("ix_bells_special_date_id", table_name="bells")
    op.drop_table("bells")
    op.drop_table("special_dates")
    op.drop_table("weekly_schedule")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
