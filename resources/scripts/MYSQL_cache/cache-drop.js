const fs = require("fs");
const { cacheFilePath } = require("./cache-config");
const { updateCache } = require("./cache-update");

async function clearCache() {
  if (!fs.existsSync(cacheFilePath)) {
    return JSON.stringify({
      status: 404,
      error: "Cache file does not exist.",
    });
  }
  fs.writeFileSync(cacheFilePath, "", "utf8");
  await updateCache();
  return JSON.stringify({
    status: 200,
    message: "Cache has been dumped and re-filled with new data from MYSQL.",
  });
}

module.exports = { clearCache };