import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('kanban_cards', (table) => {
    table
      .integer('objective_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('objectives')
      .onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('kanban_cards', (table) => {
    table.dropColumn('objective_id');
  });
}
