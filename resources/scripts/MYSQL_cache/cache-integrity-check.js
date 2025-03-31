const fs = require('fs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { dbConfig, cacheFilePath, table } = require('./cache-config');
const { updateCache } = require('./cache-update');

function hashData(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

async function hashDatabase() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.query(`SELECT * FROM ${table}`);
        await connection.end();
        return hashData(JSON.stringify(rows));
    } catch (error) {
        console.error('[ERROR] Failed to hash database:', error.message);
        throw error;
    }
}

function hashCache() {
    try {
        const data = fs.readFileSync(cacheFilePath, 'utf8');
        return hashData(data);
    } catch (error) {
        console.error('[ERROR] Failed to hash cache:', error.message);
        throw error;
    }
}

async function validateCache() {
    try {
        console.log('[INFO] Validating cache integrity...');
        const databaseHash = await hashDatabase();
        const cacheHash = hashCache();

        if (databaseHash !== cacheHash) {
            console.log('[WARNING] Cache mismatch detected. Updating cache...');
            await updateCache();
            console.log('[SUCCESS] Cache updated successfully.');
        } else {
            console.log('[INFO] Cache is valid.');
        }
    } catch (error) {
        console.error('[ERROR] Failed to validate cache:', error.message);
    }
}

module.exports = { validateCache };
