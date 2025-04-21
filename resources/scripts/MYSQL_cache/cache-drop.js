import { existsSync, writeFileSync } from 'fs';
const { cacheFilePath } = require('./cache-config.js');
import { updateCache } from './cache-update.js';
import { info, error, warn } from '../logger.js';

async function clearCache() {
    try {
        info('Clearing cache...');
        if (!existsSync(cacheFilePath)) {
            warn('Cache file does not exist. Skipping clear operation.');
            return JSON.stringify({ status: 404, error: 'Cache file not found.' });
        }

        writeFileSync(cacheFilePath, '', 'utf8');
        info('Cache file cleared.');

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
        return JSON.stringify(result);
    } catch (err) {
        error(`Error during cache clearing or updating: ${err.message}`);
        return JSON.stringify({
            status: 500,
            error: 'Failed to clear and update cache.',
            details: err.message,
        });
    }
}

export { clearCache };