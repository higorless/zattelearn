import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('zettel_notes', (table) => {
    table.increments('id').primary();
    table.integer('session_id').unsigned()
      .references('id').inTable('study_sessions').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.specificType('tags', 'text[]').defaultTo('{}');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('zettel_notes');
}
