const fs = require('fs');
const { cacheFilePath } = require('./cache-config');
const { updateCache } = require('./cache-update');
const { info, error, warn } = require('../logger');

async function clearCache() {
    try {
        info('Clearing cache...');
        if (!fs.existsSync(cacheFilePath)) {
            warn('Cache file does not exist. Skipping clear operation.');
            return JSON.stringify({ status: 404, error: 'Cache file not found.' });
        }

        // clear the cache file
        fs.writeFileSync(cacheFilePath, '', 'utf8');
        info('Cache file cleared.');

        // refill the cache with new data from MySQL
        const result = await updateCache();
        info(result.message);

        return JSON.stringify(result); // return the success response from updateCache
    } catch (err) {
        error(`Error during cache clearing or updating: ${err.message}`);
        return JSON.stringify({
            status: 500,
            error: 'Failed to clear and update cache.',
            details: err.message,
        });
    }
}

module.exports = { clearCache };
clearCache();