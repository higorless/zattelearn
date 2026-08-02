import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('kanban_cards', (table) => {
    table.dropForeign(['subject_id']);
  });
  await knex.schema.alterTable('kanban_cards', (table) => {
    table.integer('subject_id').unsigned()
      .references('id').inTable('subjects').onDelete('CASCADE')
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('kanban_cards', (table) => {
    table.dropForeign(['subject_id']);
  });
  await knex.schema.alterTable('kanban_cards', (table) => {
    table.integer('subject_id').unsigned()
      .references('id').inTable('subjects').onDelete('SET NULL')
      .alter();
  });
}
