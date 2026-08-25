require('dotenv').config();
const { Client } = require('pg');

async function createDb() {
  const baseUrl = process.env.DATABASE_URL.replace(/\/milestone$/, '/postgres');
  const client = new Client({ connectionString: baseUrl });

  try {
    await client.connect();
    const exists = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'milestone'"
    );
    if (exists.rows.length === 0) {
      await client.query('CREATE DATABASE milestone');
      console.log('✓ Database "milestone" created');
    } else {
      console.log('✓ Database "milestone" already exists');
    }
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDb();
