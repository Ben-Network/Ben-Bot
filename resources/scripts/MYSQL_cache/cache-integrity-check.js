const fs = require('fs');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { dbConfig, cacheFilePath } = require('./cache-config');
const { updateCache } = require('./cache-update');

// Function to hash data using SHA-256
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Function to get a hash of the database
async function hashDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(`SELECT * FROM ${table}`);
    await connection.end();

    const serializedData = JSON.stringify(rows, null, 2);
    console.log('Database Serialized Data:', serializedData); // Debugging

    return hashData(serializedData);
  } catch (err) {
    console.error('Error hashing database:', err.message);
    throw err;
  }
}

function hashCache() {
  try {
    if (!fs.existsSync(cacheFilePath)) {
      console.error('Cache file does not exist:', cacheFilePath);
      return null;
    }

    const data = fs.readFileSync(cacheFilePath, 'utf8');
    console.log('Cache Serialized Data:', data); // Debugging

    return hashData(data);
  } catch (err) {
    console.error('Error hashing cache file:', err.message);
    throw err;
  }
}

// Function to validate the cache file
async function validateCache() {
  try {
    console.log('Validating cache integrity...');

    const databaseHash = await hashDatabase();
    const cacheHash = hashCache();

    console.log('Database Hash:', databaseHash);
    console.log('Cache Hash:', cacheHash);

    if (!cacheHash || databaseHash !== cacheHash) {
      console.log('Cache is invalid or out of sync. Re-caching the database...');

      await updateCache();
      console.log('Cache update triggered.');

      // Recalculate hash after updating cache
      const newCacheHash = hashCache();
      console.log('New Cache Hash:', newCacheHash);

      if (databaseHash !== newCacheHash) {
        console.error('Cache update failed: Hash mismatch persists.');
        return false;
      }

      console.log('Cache successfully regenerated.');
      return true;
    }

    console.log('Cache is valid and matches the database.');
    return true;
  } catch (err) {
    console.error('Error validating cache integrity:', err.message);
    return false;
  }
}

module.exports = { validateCache };

// Run validation on script execution
(async () => {
  const result = await validateCache();
  console.log('Cache validation result:', result ? 'Valid' : 'Invalid');
})();
