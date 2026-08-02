import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('kanban_cards', (table) => {
    table.date('scheduled_for').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('kanban_cards', (table) => {
    table.dropColumn('scheduled_for');
  });
}
