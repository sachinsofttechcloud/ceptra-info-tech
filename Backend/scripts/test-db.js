const { Client } = require('pg');

async function test() {
  const client = new Client({ connectionString: 'postgresql://postgres:smohite708@@localhost:8000/signup?schema=public' });
  await client.connect();
  const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'signup'");
  console.log('Tables found in database "signup":', res.rows);
  const count = await client.query('SELECT COUNT(*) FROM signup');
  console.log('Total users registered in signup database:', count.rows[0].count);
  await client.end();
}

test().catch(err => console.error('Error testing DB:', err.message));
