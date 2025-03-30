const mysql = require('mysql2');
const fs = require('fs');
const { dbConfig, cacheFilePath } = require('./cache-config');

// Create a database connection using the configuration
const connection = mysql.createConnection(dbConfig);

// Function to initialize the cache
function initializeCache() {
  console.log('Initializing cache...');

  // Query the entire keywords table
  const query = 'SELECT word, action FROM keywords';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error querying the database:', err.message);
      connection.end();
      return;
    }

    // Format the results into a JSON object
    const cacheData = {};
    results.forEach(row => {
      cacheData[row.word] = row.action;
    });

    // Write the JSON object to the cache file
    fs.writeFile(cacheFilePath, JSON.stringify(cacheData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing to cache file:', writeErr.message);
      } else {
        console.log('Cache successfully initialized at:', cacheFilePath);
      }

      // Close the database connection
      connection.end();
    });
  });
}

// Run the cache initialization
initializeCache();