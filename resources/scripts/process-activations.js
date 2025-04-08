const { info, warn, error } = require('./logger');
const { lookupInCache } = require('./MYSQL_cache/cache-lookup');

module.exports = async function processActivations(message) {
    try {
        info(`Looking up keyword in cache: ${message}`);

        const words = message.toLowerCase().split(" ");
        for (const word of words) {
            const result = lookupInCache(word);
            if (result) {
                try {
                    result.action = typeof result.action === 'string' ? JSON.parse(result.action) : result.action;
                } catch (parseError) {
                    error(`Failed to parse action for keyword: ${word}. Error: ${parseError.message}`);
                    continue;
                }

                if (!result.action?.type || !result.action?.content) {
                    warn(`Invalid activation result for keyword: ${word}. Skipping.`);
                    continue;
                }

                info(`Match found for keyword: ${word}`);
                return result;
            }
        }

        info('No match found in cache. Sad.');
        return null;
    } catch (err) {
        error(`Error processing activations: ${err.message}`);
        return null;
    }
};