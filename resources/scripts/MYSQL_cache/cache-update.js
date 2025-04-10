const fs = require('fs');
const mysql = require('mysql2/promise');
const { dbConfig, cacheFilePath, table } = require('./cache-config');
const { info, error, warn } = require('../logger');
const { markCacheAsUpdated } = require('./cache-integrity-check');

function isValidEntry(entry) {
    // Validate that the entry has the required properties
    if (!entry || typeof entry.word !== 'string') {
        return false;
    }

    // Validate the nested action object
    if (typeof entry.action === 'object') {
        const { type, content } = entry.action;
        if (typeof type !== 'string' || typeof content !== 'string') {
            return false;
        }
    } else {
        return false; // If action is not an object, the entry is invalid
    }

    return true;
}

function validateCacheEntry(entry) {
    if (!isValidEntry(entry)) {
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

        markCacheAsUpdated(); // Mark cache as updated to skip validation
        return { status: 200, message: 'Cache updated successfully.' };
    } catch (err) {
        error(`[ERROR] Failed to update cache: ${err.message}`);
        return { status: 500, message: `Cache update failed: ${err.message}` };
    }
}

module.exports = { updateCache };