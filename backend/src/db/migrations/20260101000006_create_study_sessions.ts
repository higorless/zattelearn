import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('study_sessions', (table) => {
    table.increments('id').primary();
    table.integer('card_id').unsigned().notNullable()
      .references('id').inTable('kanban_cards').onDelete('CASCADE');
    table.timestamp('started_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('ended_at');
    table.integer('duration_seconds');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('study_sessions');
}
