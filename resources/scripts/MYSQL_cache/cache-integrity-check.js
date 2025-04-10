const fs = require('fs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { dbConfig, cacheFilePath, table } = require('./cache-config');
const { updateCache } = require('./cache-update');
const { info, error } = require('../logger');

let skipValidation = false; // Flag to skip validation if cache was just updated

function hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

async function hashDatabase() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query(`SELECT * FROM ${table}`);
        await connection.end();
        return hashData(JSON.stringify(rows));
    } catch (err) {
        error(`[ERROR] Failed to hash database: ${err.message}`);
        throw err;
    }
}

function hashCache() {
    try {
        const data = fs.readFileSync(cacheFilePath, 'utf8');
        return hashData(data);
    } catch (err) {
        error(`[ERROR] Failed to hash cache: ${err.message}`);
        throw err;
    }
}

async function validateCache() {
    if (skipValidation) {
        info('[INFO] Skipping cache validation as it was recently updated.');
        skipValidation = false; // Reset the flag
        return;
    }

    try {
        info('[INFO] Validating cache integrity...');
        const databaseHash = await hashDatabase();
        const cacheHash = hashCache();

        if (databaseHash !== cacheHash) {
            info('[WARNING] Cache mismatch detected. Updating cache...');
            await updateCache();
            info('[SUCCESS] Cache updated successfully.');
        } else {
            info('[INFO] Cache is valid.');
        }
    } catch (err) {
        error(`[ERROR] Cache validation failed: ${err.message}`);
    }
}

function markCacheAsUpdated() {
    skipValidation = true;
    info('[INFO] Cache marked as updated. Validation will be skipped temporarily.');
}

module.exports = { validateCache, markCacheAsUpdated };
