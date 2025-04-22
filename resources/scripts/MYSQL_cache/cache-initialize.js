import { createConnection } from 'mysql2/promise';
import { writeFileSync } from 'fs';
import { dbConfig, cacheFilePath, table } from './cache-config.js';

async function initializeCache() {
    console.log('[INFO] Initializing cache...');

    try {
        const connection = await createConnection(dbConfig);
        const [rows] = await connection.query(`SELECT word, action FROM ${table}`);
        await connection.end();

        const cacheData = rows.reduce((acc, row) => {
            acc[row.word] = row.action;
            return acc;
        }, {});

        writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf8');
        console.log(`[SUCCESS] Cache initialized successfully at: ${cacheFilePath}`);
    } catch (err) {
        console.error(`[ERROR] Failed to initialize cache: ${err.message}`);
    }
}

export { initializeCache };