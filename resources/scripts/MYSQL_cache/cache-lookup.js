const fs = require('fs');
const { cacheFilePath } = require('./cache-config');
const { info, error } = require('../logger');

function lookupInCache(keyword) {
    try {
        if (!fs.existsSync(cacheFilePath)) {
            error('Cache file does not exist.');
            return null;
        }

        const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        const result = cacheData.find(entry => entry.word?.toLowerCase() === keyword.toLowerCase());

        if (result) {
            info(`Cache hit for keyword: ${keyword}`);
        } else {
            info(`No match found for keyword: ${keyword}`);
        }

        return result;
    } catch (err) {
        error(`Error during cache lookup: ${err.message}`);
        return null;
    }
}

module.exports = { lookupInCache };
