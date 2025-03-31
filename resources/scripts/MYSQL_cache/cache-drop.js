const fs = require("fs");
const { cacheFilePath } = require("./cache-config");
const { updateCache } = require("./cache-update");

async function clearCache() {
  try {
    if (!fs.existsSync(cacheFilePath)) {
      return JSON.stringify({
        status: 404,
        error: "Cache file does not exist.",
      });
    }

    // Clear the cache file
    fs.writeFileSync(cacheFilePath, "", "utf8");
    console.log("Cache file cleared.");

    // Refill the cache with new data from MySQL
    const result = await updateCache();
    console.log(result.message);

    return JSON.stringify(result); // Return the success response from updateCache
  } catch (err) {
    console.error("Error during cache clearing or updating:", err.message);
    return JSON.stringify({
      status: 500,
      error: "Failed to clear and update cache.",
      details: err.message,
    });
  }
}

module.exports = { clearCache };