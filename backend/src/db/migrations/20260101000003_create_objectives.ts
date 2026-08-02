import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('objectives', (table) => {
    table.increments('id').primary();
    table.integer('subject_id').unsigned().notNullable()
      .references('id').inTable('subjects').onDelete('CASCADE');
    table.string('title', 255).notNullable();
    table.text('description');
    table.enum('status', ['pending', 'in_progress', 'done']).defaultTo('pending');
    table.date('due_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('objectives');
}
