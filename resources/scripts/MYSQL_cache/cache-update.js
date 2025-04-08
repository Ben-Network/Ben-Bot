const fs = require('fs');
const mysql = require('mysql2/promise');
const { dbConfig, cacheFilePath, table } = require('./cache-config');
const { info, error, warn } = require('../logger');

function validateCacheEntry(entry) {
    if (!entry.type || !entry.content || typeof entry.type !== 'string') {
        warn(`Invalid cache entry detected: ${JSON.stringify(entry)}`);
        return false;
    }
    return true;
}

async function updateCache() {
    try {
        if (!table) {
            throw new Error('Table name is not defined in cache-config.js');
        }

        info(`[INFO] Fetching data from table: ${table}`);
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query(`SELECT * FROM ${table}`);
        await connection.end();

        const validRows = rows.filter(validateCacheEntry);

        fs.writeFileSync(cacheFilePath, JSON.stringify(validRows, null, 2), 'utf8');
        info(`[SUCCESS] Cache updated successfully. Data written to: ${cacheFilePath}`);
        return { status: 200, message: 'Cache updated successfully.' };
    } catch (err) {
        error(`[ERROR] Failed to update cache: ${err.message}`);
        return { status: 500, message: `Cache update failed: ${err.message}` };
    }
}

module.exports = { updateCache };
