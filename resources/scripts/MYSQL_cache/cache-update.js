const fs = require('fs');
const mysql = require('mysql2/promise');
const { dbConfig, cacheFilePath, table } = require('./cache-config');

async function updateCache() {
  try {
    console.log('Fetching data from database...');

    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(`SELECT * FROM ${table}`);
    await connection.end();

    console.log('Database rows:', rows); // Debugging step

    // Write the rows directly to the cache file as JSON
    fs.writeFileSync(cacheFilePath, JSON.stringify(rows, "", 2), 'utf8');

    console.log('Cache updated successfully.');
  } catch (err) {
    console.error('Error updating cache:', err.message);
  }
}

module.exports = { updateCache };
