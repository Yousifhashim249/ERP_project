"""add cascade delete to employee relations

Revision ID: 7ec51c4047bf
Revises: 75ddba2fbe1f
Create Date: 2026-02-25 11:47:16.909419

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7ec51c4047bf'
down_revision: Union[str, Sequence[str], None] = '75ddba2fbe1f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade():
    op.drop_constraint('bonuses_employee_id_fkey', 'bonuses', type_='foreignkey')
    op.create_foreign_key(
        None,
        'bonuses',
        'employees',
        ['employee_id'],
        ['id'],
        ondelete='CASCADE'
    )

    op.drop_constraint('deductions_employee_id_fkey', 'deductions', type_='foreignkey')
    op.create_foreign_key(
        None,
        'deductions',
        'employees',
        ['employee_id'],
        ['id'],
        ondelete='CASCADE'
    )


def downgrade():
    pass