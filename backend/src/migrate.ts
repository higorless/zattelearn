import db from './db/knex'

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
