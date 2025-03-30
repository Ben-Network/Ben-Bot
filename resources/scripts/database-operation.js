const mysql = require('mysql2');
const fs = require('fs');
const { dbConfig, cacheFilePath, table } = require('./resources/scripts/MYSQL_cache/cache-config');
const { updateCache } = require('./resources/scripts/MYSQL_cache/cache-update');
const { validateCache } = require('./resources/scripts/MYSQL_cache/cache-integrity-check');

// Create a database connection using the configuration
const connection = mysql.createConnection(dbConfig);

// Function to handle database operations
async function operation(opType, input, action, authorID, notes, readType, source) {
    try {
        // Validate required inputs
        if (!opType) {
            throw new Error('Operation type (opType) is required.');
        }
        if (['add', 'modify'].includes(opType) && !action) {
            throw new Error('Action is required for add and modify operations.');
        }

        switch (opType) {
            case 'add':
                await addCommand(input, action, authorID, notes);
                break;
            case 'remove':
                await removeCommand(input);
                break;
            case 'modify':
                await modifyCommand(input, action, notes);
                break;
            case 'read':
                if (source === 'cache') {
                    await readFromCache(readType, input);
                } else if (source === 'mysql') {
                    await readFromDatabaseWithRetry(readType, input);
                } else {
                    throw new Error(`Invalid source: ${source}`);
                }
                break;
            default:
                throw new Error(`Invalid operation type: ${opType}`);
        }
    } catch (err) {
        console.error('Error performing database operation:', err.message);
        Actions.storeValue(JSON.stringify({ status: 500, error: err.message }), 1, 'output', cache);
    }
}

// Function to add a new command
async function addCommand(input, action, authorID, notes) {
    // Ensure action is JSON
    if (typeof action === 'object') {
        action = JSON.stringify(action);
    }
    if (!validateAction(action)) {
        throw new Error('Action must be a valid JSON string.');
    }

    // Prepare the query and parameters
    const query = `INSERT INTO {$table} (word, action, authorID, notes, activations) VALUES (?, ?, ?, ?, ?)`;
    const params = [input, action, authorID || null, notes || null, null]; // activations is set to NULL

    console.log(`Inserting into ${table}:`, params); // Debugging

    return new Promise((resolve, reject) => {
        connection.query(query, params, async (err, results) => {
            if (err) {
                console.error('Error adding command:', err.message);
                return reject(err);
            }
            console.log('Command added successfully:', results);
            await updateCache(); // Update the cache after adding
            try {await validateCache(); 
                Actions.storeValue(JSON.stringify({ status: 200, Message: `Command added to MYSQL, cache has updated & passed validation.` }), 1, 'output', cache);
            }
            catch {
                Actions.storeValue(JSON.stringify({ status: 500, error: `Cache validation failed: ${err.message}` }), 1, 'output', cache);
            }
            resolve(results);
        });
    });
}

// Helper function to validate JSON
function validateAction(action) {
    try {
        JSON.parse(action); // Check if it's valid JSON
        return true;
    } catch (err) {
        console.error('Invalid action JSON:', err.message);
        return false;
    }
}

// Function to remove a command
async function removeCommand(input) {
    const query = `DELETE FROM ${table} WHERE word = ?`;
    const params = [input];

    return new Promise((resolve, reject) => {
        connection.query(query, params, async (err, results) => {
            if (err) {
                console.error('Error removing command:', err.message);
                return reject(err);
            }
            console.log('Command removed successfully:', results);
            await updateCache(); // Update the cache after removing
            try {await validateCache(); 
                Actions.storeValue(JSON.stringify({ status: 200, Message: `Command removed from MYSQL, cache has updated & passed validation.` }), 1, 'output', cache);
            }
            catch {
                Actions.storeValue(JSON.stringify({ status: 500, error: `Cache validation failed: ${err.message}` }), 1, 'output', cache);
            }
            resolve(results);
        });
    });
}

// Function to modify an existing command
async function modifyCommand(input, action, notes) {
    const query = `UPDATE ${table} SET action = ?, notes = ? WHERE word = ?`;
    const params = [action, notes, input];

    return new Promise((resolve, reject) => {
        connection.query(query, params, async (err, results) => {
            if (err) {
                console.error('Error modifying command:', err.message);
                return reject(err);
            }
            console.log('Command modified successfully:', results);
            await updateCache(); // Update the cache after modifying
            resolve(results);
        });
    });
}

// Function to read from the cache
async function readFromCache(readType, input) {
    try {
        const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        let result;

        switch (readType) {
            case 'schema':
                result = cacheData;
                break;
            case 'keyword':
                result = cacheData.find((entry) => entry.word === input) || null;
                break;
            case 'authorID':
                result = cacheData.filter((entry) => entry.authorID === input);
                break;
            default:
                throw new Error(`Invalid read type: ${readType}`);
        }

        Actions.storeValue(JSON.stringify(result), 1, 'output', cache);
        console.log('Read operation from cache successful:', result);
    } catch (err) {
        console.error('Error reading from cache:', err.message);
        throw err;
    }
}

// Function to read from the database with retries
async function readFromDatabaseWithRetry(readType, input, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await readFromDatabase(readType, input);
        } catch (err) {
            console.error(`Database query failed (attempt ${attempt}/${retries}):`, err.message);
            if (attempt === retries) {
                throw new Error('Failed to read from database after multiple attempts.');
            }
        }
    }
}

// Function to read from the database
async function readFromDatabase(readType, input) {
    let query;
    let params = [];

    switch (readType) {
        case 'schema':
            query = `SELECT * FROM #{table`;
            break;
        case 'keyword':
            query = `SELECT * FROM ${table} WHERE word = ?`;
            params = [input];
            break;
        case 'authorID':
            query = `SELECT * FROM ${table} WHERE authorID = ?`;
            params = [input];
            break;
        default:
            throw new Error(`Invalid read type: ${readType}`);
    }

    return new Promise((resolve, reject) => {
        connection.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }

            const formattedResult = JSON.stringify(results.length > 0 ? results : [], null, 2);
            Actions.storeValue(formattedResult, 1, 'output', cache);
            console.log('Read operation from database successful:', formattedResult);
            resolve(results);
        });
    });
}

// Example usage
(async () => {
    const opType = tempVars('opType');
    const input = tempVars('input');
    const action = {
        type: tempVars('actionType'), // Call the function and use its return value
        content: tempVars('actionContent') // Call the function and use its return value
    };
    const authorID = tempVars('authorID');
    const notes = tempVars('notes');
    const readType = tempVars('readType');
    const source = tempVars('source');

    console.log(opType, input, action, authorID, notes, readType, source);

    await operation(opType, input, action, authorID, notes, readType, source);

    if (typeof cache !== 'undefined') {
        Actions.callNextAction(cache);
    }

    // Close the MySQL connection safely
    connection.end((err) => {
        if (err) {
            console.error('Error closing MySQL connection:', err.message);
        }
    });
})();
