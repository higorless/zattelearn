import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('subjects', (table) => {
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('subjects', (table) => {
    table.dropColumn('user_id');
  });
}
