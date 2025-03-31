const fs = require('fs');
const path = require('path');
const { cacheFilePath } = require(path.join(__dirname, 'MYSQL_cache', 'cache-config'));
const { lookupInCache } = require(path.join(__dirname, 'MYSQL_cache', 'cache-lookup'));

module.exports = async function processActivations(message) {
    try {
        const words = message.toLowerCase().split(" ");
        let result = null;

        for (const word of words) {
            result = lookupInCache(word);
            if (result) {
                console.log(`Match found for word: ${word}`);
                return result; // Return the first match
            }
        }

        console.log('No match found in cache.');
        return null; // No match found
    } catch (error) {
        console.error('Error processing activations:', error.message);
        return null;
    }
};