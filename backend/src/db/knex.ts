import knex from 'knex';
import pg from 'pg';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// OID 1082 = PostgreSQL 'date' type.
// By default, pg parses it as a JS Date (with local TZ shift).
// We want it back as a plain "YYYY-MM-DD" string.
pg.types.setTypeParser(1082, (val: string) => val);

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL ?? {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'zettelearn',
    user: process.env.DB_USER || 'zettelearn',
    password: process.env.DB_PASSWORD || 'zettelearn',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: path.join(__dirname, 'migrations'),
    extension: 'ts',
    loadExtensions: ['.ts'],
  },
});

export default db;
