import { existsSync, readFileSync } from 'fs';

const keyword = "ben";

try {
    if (!existsSync("../../cache/cache.json")) {
        console.log('Cache file does not exist.');
        console.log("null");
    }

    const cacheData = JSON.parse(readFileSync("../../cache/cache.json", 'utf8'));
    const result = cacheData.find(entry => entry.word?.toLowerCase() === keyword.toLowerCase());

    if (result) {
        console.log(`Cache hit for keyword: ${keyword}`);
    } else {
        console.log(`No match found for keyword: ${keyword}`);
    }

    console.log(result);
} catch (err) {
    console.log(`Error during cache lookup: ${err.message}`);
    console.log("null");
}
