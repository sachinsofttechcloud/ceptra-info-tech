const { Client } = require('pg');

async function createSignupDatabase() {
  const rootConnectionString = 'postgresql://postgres:smohite708@@localhost:8000/postgres';
  const client = new Client({ connectionString: rootConnectionString });

  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'signup'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE signup');
      console.log('Database "signup" created successfully!');
    } else {
      console.log('Database "signup" already exists.');
    }
  } catch (err) {
    console.warn('Error checking/creating database "signup":', err.message);
  } finally {
    await client.end();
  }
}

createSignupDatabase();
