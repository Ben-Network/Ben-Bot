const fs = require('fs');
const path = require('path');
const { cacheFilePath, analyticsFilePath } = require('../MYSQL_cache/cache-config');
const { clearCache } = require('../MYSQL_cache/cache-drop');

const logFilePath = path.join(__dirname, '../../../bot.log');
const replayLogFilePath = path.join(__dirname, '../../../resources/cache/replay.log');

function clearFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '', 'utf8');
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
        fs.writeFileSync(analyticsFilePath, JSON.stringify(analyticsData, null, 2), 'utf8');
        console.log(`[INFO] Cache analytics reset: ${analyticsFilePath}`);
    } catch (err) {
        console.error(`[ERROR] Failed to reset cache analytics: ${err.message}`);
    }
}

async function prep() {
    console.log('[INFO] Preparing bot for production...');
    clearFile(logFilePath);
    clearFile(replayLogFilePath);
    resetAnalytics();
    await clearCache();
    console.log('[INFO] Bot is ready for production.');
}

prep();
