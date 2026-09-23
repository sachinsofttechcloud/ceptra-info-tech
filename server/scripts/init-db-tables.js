const { Pool } = require('pg');

async function initTables() {
  const connectionString = 'postgresql://postgres:smohite708@@localhost:8000/signup?schema=public';
  const pool = new Pool({ connectionString });

  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database "signup". Creating table "signup"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS signup (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        otp VARCHAR(10),
        otp_expires_at TIMESTAMP,
        last_login_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      ALTER TABLE signup ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS login (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        group_type VARCHAR(100) NOT NULL,
        layout VARCHAR(50),
        heading VARCHAR(255),
        see_all_href VARCHAR(255),
        sort_order INT NOT NULL DEFAULT 0,
        item_order INT NOT NULL DEFAULT 0,
        slug VARCHAR(255) NOT NULL,
        title VARCHAR(500) NOT NULL,
        image VARCHAR(500),
        tags TEXT,
        price INT NOT NULL,
        original_price INT,
        badge VARCHAR(100),
        href VARCHAR(500),
        UNIQUE (group_type, slug)
      );
    `);
    console.log('Tables "signup", "login", and "courses" are ready.');
    client.release();
  } catch (err) {
    console.error('Failed to create table in database "signup":', err.message);
  } finally {
    await pool.end();
  }
}

initTables();
