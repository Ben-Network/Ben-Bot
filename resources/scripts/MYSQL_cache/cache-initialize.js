const mysql = require('mysql2/promise');
const fs = require('fs');
const { dbConfig, cacheFilePath, table } = require('./cache-config');

async function initializeCache() {
    console.log('[INFO] Initializing cache...');

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query(`SELECT word, action FROM ${table}`);
        await connection.end();

        const cacheData = rows.reduce((acc, row) => {
            acc[row.word] = row.action;
            return acc;
        }, {});

        fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf8');
        console.log(`[SUCCESS] Cache initialized successfully at: ${cacheFilePath}`);
    } catch (err) {
        console.error(`[ERROR] Failed to initialize cache: ${err.message}`);
    }
}

module.exports = { initializeCache };