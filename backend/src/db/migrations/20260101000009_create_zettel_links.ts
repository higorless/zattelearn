import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('zettel_links', (table) => {
    table.increments('id').primary();
    table.integer('from_note_id').unsigned().notNullable()
      .references('id').inTable('zettel_notes').onDelete('CASCADE');
    table.integer('to_note_id').unsigned().notNullable()
      .references('id').inTable('zettel_notes').onDelete('CASCADE');
    table.string('relationship_type', 100).defaultTo('related');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.unique(['from_note_id', 'to_note_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('zettel_links');
}
