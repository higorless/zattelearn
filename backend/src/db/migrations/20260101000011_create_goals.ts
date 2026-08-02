import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('goals', (table) => {
    table.increments('id').primary();
    table.integer('subject_id').unsigned().notNullable()
      .references('id').inTable('subjects').onDelete('CASCADE');
    table.integer('topic_id').unsigned().nullable()
      .references('id').inTable('topics').onDelete('SET NULL');
    table.string('title', 255).notNullable();
    table.decimal('target_hours', 8, 2).notNullable();
    table.date('deadline').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('goals');
}
