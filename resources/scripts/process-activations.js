const fs = require('fs');
const path = require('path');
const { cacheFilePath } = require(path.join(__dirname, 'resources', 'scripts', 'MYSQL_cache', 'cache-config'));
const { lookupInCache } = require(path.join(__dirname, 'resources', 'scripts', 'MYSQL_cache', 'cache-lookup'));
console.log("lookupInCache:", lookupInCache); // Debugging line

const words = tempVars("message").toLowerCase();
const array = words.split(" ");
var output = []; // Store results as an array of objects
let hasResult = false; // Flag to track if a match is found

// Process each word in the array
array.forEach((word) => {
  if (!hasResult) {
    const result = lookupInCache(word); // Use lookupInCache instead of checkCache
    if (result) {
      output.push(result);
      hasResult = true; // Stop processing after the first match to not spam the server lmao
    }
  }
});

// Finalize the result
if (hasResult) {
  Actions.storeValue(JSON.stringify(output[0]), 1, "result", cache); // Return the first match only :3
} else {
  console.log('No match found in cache.');
  Actions.storeValue(null, 1, "result", cache); // Store null to avoid crashing
}
Actions.callNextAction(cache);