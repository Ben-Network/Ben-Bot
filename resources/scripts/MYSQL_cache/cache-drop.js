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

        // Clear the cache file
        fs.writeFileSync(cacheFilePath, '', 'utf8');
        info('Cache file cleared.');

        // Refill the cache with new data from MySQL
        const result = await updateCache();

        if (result.status !== 200) {
            error(`Cache update failed: ${result.message}`);
            return JSON.stringify({
                status: 500,
                error: 'Failed to update cache after clearing.',
                details: result.message,
            });
        }

        info(result.message);
        return JSON.stringify(result); // Return the success response from updateCache
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