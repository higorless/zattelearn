import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('session_comments', (table) => {
    table.increments('id').primary();
    table.integer('session_id').unsigned().notNullable()
      .references('id').inTable('study_sessions').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('session_comments');
}
