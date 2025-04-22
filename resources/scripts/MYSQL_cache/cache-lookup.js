import { existsSync, readFileSync } from 'fs';
import cacheConfig from './cache-config.js';
import { info, error } from '../logger.js';
const { cacheFilePath } = cacheConfig;

function lookupInCache(keyword) {
    try {
        if (!existsSync(cacheFilePath)) {
            error('Cache file does not exist.');
            return null;
        }

        const cacheData = JSON.parse(readFileSync(cacheFilePath, 'utf8'));
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

export { lookupInCache };