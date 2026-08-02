import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('kanban_cards', (table) => {
    table.increments('id').primary();
    table.integer('column_id').unsigned().notNullable()
      .references('id').inTable('kanban_columns').onDelete('CASCADE');
    table.integer('subject_id').unsigned()
      .references('id').inTable('subjects').onDelete('SET NULL');
    table.integer('topic_id').unsigned()
      .references('id').inTable('topics').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.text('description');
    table.integer('position').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('kanban_cards');
}
