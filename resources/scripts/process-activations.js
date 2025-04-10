const { info, warn, error } = require('./logger');
const { lookupInCache } = require('./MYSQL_cache/cache-lookup');

module.exports = async function processActivations(message) {
    try {
        info(`Looking up keyword in cache: ${message}`);

        const words = getWordsFromMessage(message);
        const activation = findMatchingActivation(words);
        if (activation) {
            info(`Match found for keyword: ${activation.keyword}`);
            return activation;
        }

        info('No match found in cache. Sad.');
        return null;
    } catch (err) {
        error(`Error processing activations: ${err.message}`);
        return null;
    }
};

function getWordsFromMessage(message) {
    return message.toLowerCase().split(" ");
}

function findMatchingActivation(words) {
    for (const word of words) {
        const result = lookupInCache(word);
        if (result) {
            const activation = parseActivation(result);
            if (activation) {
                return {
                    keyword: word,
                    action: activation
                };
            }
        }
    }
    return null;
}

function parseActivation(result) {
    try {
        result.action = typeof result.action === 'string' ? JSON.parse(result.action) : result.action;
    } catch (parseError) {
        error(`Failed to parse action for keyword: ${result.keyword}. Error: ${parseError.message}`);
        return null;
    }

    if (!result.action?.type || !result.action?.content) {
        warn(`Invalid activation result for keyword: ${result.keyword}. Skipping.`);
        return null;
    }
    return result.action;
}