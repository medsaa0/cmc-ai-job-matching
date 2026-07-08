"""add_reponses_questionnaire_and_score_questionnaire

Revision ID: 3406fd3a18f0
Revises: 568313a4bb48
Create Date: 2026-07-08 13:43:13.391772

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3406fd3a18f0'
down_revision: Union[str, None] = '568313a4bb48'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Table absente du diff autogenere : elle avait deja ete creee par
    # Base.metadata.create_all() au demarrage du serveur de dev avant que
    # cette migration ne soit generee. Ecrite a la main pour rester rejouable
    # sur une base vierge.
    op.create_table(
        'reponses_questionnaire',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('id_laureat', sa.String(length=20), nullable=False, unique=True, index=True),
        sa.Column('reponses_json', sa.Text(), nullable=False),
        sa.Column('niveau_competences_auto', sa.Integer(), nullable=True),
        sa.Column('nb_projets', sa.String(length=50), nullable=True),
        sa.Column('a_fait_stage_ou_alternance', sa.Boolean(), nullable=True),
        sa.Column('soft_skill_travail_equipe', sa.Integer(), nullable=True),
        sa.Column('soft_skill_autonomie', sa.Integer(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()')),
    )
    op.add_column('matching_results', sa.Column('score_questionnaire', sa.Float(), nullable=False, server_default='50'))


def downgrade() -> None:
    op.drop_column('matching_results', 'score_questionnaire')
    op.drop_table('reponses_questionnaire')
