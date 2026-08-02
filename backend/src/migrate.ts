import db from './db/knex'

if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
  console.error('ERROR: DATABASE_URL or DB_HOST must be set')
  process.exit(1)
}

async function migrate() {
  console.log('Running migrations...')
  const [batch, migrations] = await db.migrate.latest()
  if (migrations.length === 0) {
    console.log('Already up to date.')
  } else {
    console.log(`Batch ${batch} — ran ${migrations.length} migration(s):`)
    migrations.forEach((m: string) => console.log(`  ✓ ${m}`))
  }
  await db.destroy()
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
