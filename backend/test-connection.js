const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:chedibaaka123@localhost:5432/daily_learning_db",
  connectionTimeoutMillis: 5000,
});

async function test() {
  try {
    console.log('🔄 Connecting to local PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();