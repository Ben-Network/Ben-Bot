const fs = require('fs');
const mysql = require('mysql2/promise');
const { dbConfig, cacheFilePath, table } = require('./cache-config');

async function updateCache() {
    try {
        if (!table) {
            throw new Error('Table name is not defined in cache-config.js');
        }

        console.log(`[INFO] Fetching data from table: ${table}`);
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query(`SELECT * FROM ${table}`);
        await connection.end();

        fs.writeFileSync(cacheFilePath, JSON.stringify(rows, null, 2), 'utf8');
        console.log(`[SUCCESS] Cache updated successfully. Data written to: ${cacheFilePath}`);
        return { status: 200, message: 'Cache updated successfully.' };
    } catch (error) {
        console.error(`[ERROR] Failed to update cache: ${error.message}`);
        return { status: 500, message: `Cache update failed: ${error.message}` };
    }
}

module.exports = { updateCache };
