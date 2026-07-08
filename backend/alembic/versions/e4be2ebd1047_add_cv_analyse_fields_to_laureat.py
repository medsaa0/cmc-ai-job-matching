"""add_cv_analyse_fields_to_laureat

Revision ID: e4be2ebd1047
Revises: 3406fd3a18f0
Create Date: 2026-07-08 14:24:15.314275

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e4be2ebd1047'
down_revision: Union[str, None] = '3406fd3a18f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('laureats', sa.Column('cv_analyse_json', sa.Text(), nullable=True))
    op.add_column('laureats', sa.Column('cv_analyse_statut', sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column('laureats', 'cv_analyse_statut')
    op.drop_column('laureats', 'cv_analyse_json')
