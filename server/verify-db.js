    const mysql = require('mysql2/promise');

async function testConnection() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'atpsm-jemmel'
  });

  try {
    await connection.connect();
    console.log('✅ Successfully connected to MySQL database');
    
    const [rows] = await connection.query('SELECT 1 + 1 AS solution');
    console.log(`✅ Test query result: ${rows[0].solution}`);
    
    const [dbs] = await connection.query('SHOW DATABASES');
    console.log('✅ Available databases:');
    dbs.forEach(db => console.log(` - ${db.Database}`));
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await connection.end();
  }
}

testConnection();