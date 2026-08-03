import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zettel_notes', (table) => {
    table.dropForeign(['session_id']);
  });
  await knex.schema.alterTable('zettel_notes', (table) => {
    table.integer('session_id').unsigned()
      .references('id').inTable('study_sessions').onDelete('CASCADE')
      .alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('zettel_notes', (table) => {
    table.dropForeign(['session_id']);
  });
  await knex.schema.alterTable('zettel_notes', (table) => {
    table.integer('session_id').unsigned()
      .references('id').inTable('study_sessions').onDelete('SET NULL')
      .alter();
  });
}
