import { existsSync, writeFileSync } from 'fs';
import { cacheFilePath, analyticsFilePath } from '../MYSQL_cache/cache-config.js';
import { clearCache } from '../MYSQL_cache/cache-drop.js';

const logFilePath = '../../../bot.log';
const replayLogFilePath = '../../../resources/cache/replay.log';

function clearFile(filePath) {
    try {
        if (existsSync(filePath)) {
            writeFileSync(filePath, '', 'utf8');
            console.log(`[INFO] Cleared file: ${filePath}`);
        } else {
            console.log(`[INFO] File does not exist, skipping: ${filePath}`);
        }
    } catch (err) {
        console.error(`[ERROR] Failed to clear file: ${filePath}. Error: ${err.message}`);
    }
}

function resetAnalytics() {
    try {
        const analyticsData = { hits: null, miss: null };
        writeFileSync(analyticsFilePath, JSON.stringify(analyticsData, null, 2), 'utf8');
        console.log(`[INFO] Cache analytics reset: ${analyticsFilePath}`);
    } catch (err) {
        console.error(`[ERROR] Failed to reset cache analytics: ${err.message}`);
    }
}

function resetCache() {
    try {
        const cacheData = [];
        writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), 'utf8');
        console.log(`[INFO] Cache reset: ${cacheFilePath}`);
    } catch (err) {
        console.error(`[ERROR] Failed to reset cache: ${err.message}`);
    }
}

async function prep() {
    console.log('[INFO] Preparing bot for production...');
    clearFile(logFilePath);
    clearFile(replayLogFilePath);
    resetCache();
    resetAnalytics();
    await clearCache();
    console.log('[INFO] Bot is ready for production.');
}

prep();
