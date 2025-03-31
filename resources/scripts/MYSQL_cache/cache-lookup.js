const fs = require('fs');
const { cacheFilePath } = require('./cache-config');

function lookupInCache(keyword) {
    try {
        console.log(`[INFO] Looking up keyword in cache: ${keyword}`);
        const data = fs.readFileSync(cacheFilePath, 'utf8');
        const cache = JSON.parse(data);

        const match = cache.find(entry => entry.word === keyword);
        if (match) {
            console.log(`[SUCCESS] Cache hit for keyword: ${keyword}`);
            return JSON.parse(match.action);
        } else {
            console.log(`[INFO] Cache miss for keyword: ${keyword}`);
            return null;
        }
    } catch (error) {
        console.error(`[ERROR] Failed to lookup keyword in cache: ${error.message}`);
        return null;
    }
}

module.exports = { lookupInCache };
