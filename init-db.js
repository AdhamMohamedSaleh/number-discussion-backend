const { Pool } = require('./backend/node_modules/pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    const sqlPath = path.join(__dirname, 'backend/src/config/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Initializing database...');
    await pool.query(sql);
    console.log('✅ Database initialized successfully!');

    // Verify tables were created
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    console.log('\nCreated tables:');
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
