import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { createConnection } from 'mysql2/promise';
import { dbConfig, cacheFilePath, table } from './cache-config.js';
import updateCache from './cache-update.js';
import { info, error } from '../logger.js';
import { shouldSkipValidation } from './cache-utils.js';

function hashData(data) {
    return createHash('sha256').update(data).digest('hex');
}

async function hashDatabase() {
    try {
        const connection = await createConnection(dbConfig);
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
        const data = readFileSync(cacheFilePath, 'utf8');
        return hashData(data);
    } catch (err) {
        error(`[ERROR] Failed to hash cache: ${err.message}`);
        throw err;
    }
}

async function validateCache() {
    if (shouldSkipValidation()) {
        console.info('[INFO] Skipping cache validation as it was recently updated.');
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

export { validateCache };
