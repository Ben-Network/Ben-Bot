const fs = require('fs');
const { cacheFilePath } = require('./cache-config');
const { trackCacheUsage } = require('./cache-management');

function lookupInCache(keyword) {
  try {
    const data = fs.readFileSync(cacheFilePath, 'utf8');
    let cache;
    try {
      cache = JSON.parse(data);
    } catch (jsonError) {
      console.error('Error parsing JSON from cache:', jsonError.message);
      return null;
    }

    const match = cache.find((entry) => entry.word === keyword);
    if (match) {
      const action = JSON.parse(match.action);
      console.log('Cache hit:', action);
      trackCacheUsage('hits');
      return action;
    } else {
      console.log('Cache miss: No action found for', keyword);
      return null;
    }
  } catch (err) {
    console.error('Error reading cache file:', err.message);
    return null;
  }
}

console.log('Exporting lookupInCache:', lookupInCache);

module.exports = { lookupInCache };
