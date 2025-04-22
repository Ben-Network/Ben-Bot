import { writeFileSync } from 'fs';
import { createConnection } from 'mysql2/promise';
import cacheConfig from './cache-config.js';
import { info, error, warn } from '../logger.js';
const { dbConfig, cacheFilePath, table } = cacheConfig;

function isValidEntry(entry) {
    if (!entry || typeof entry.word !== 'string') {
        return false;
    }

    if (typeof entry.action === 'object') {
        const { type, content } = entry.action;
        if (typeof type !== 'string' || typeof content !== 'string') {
            return false;
        }
    } else {
        return false;
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
        const connection = await createConnection(dbConfig);
        const [rows] = await connection.query(`SELECT * FROM ${table}`);
        await connection.end();

        const validRows = rows.filter(validateCacheEntry);

        writeFileSync(cacheFilePath, JSON.stringify(validRows, null, 2), 'utf8');
        info(`[SUCCESS] Cache updated successfully. Data written to: ${cacheFilePath}`);

        return { status: 200, message: 'Cache updated successfully.' };
    } catch (err) {
        error(`[ERROR] Failed to update cache: ${err.message}`);
        return { status: 500, message: `Cache update failed: ${err.message}` };
    }
}

export { updateCache };