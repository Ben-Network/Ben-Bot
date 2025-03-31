const mysql = require('mysql2');
const fs = require('fs');
const { dbConfig, cacheFilePath, table } = require('./MYSQL_cache/cache-config');
const { updateCache } = require('./MYSQL_cache/cache-update');
const { validateCache } = require('./MYSQL_cache/cache-integrity-check');
const chalk = require('chalk');

const connection = mysql.createConnection(dbConfig);

async function operation(opType, input, action, authorID, notes, readType, source) {
    try {
        if (!opType) {
            throw new Error('Operation type (opType) is required.');
        }
        if (['add', 'modify'].includes(opType) && !action) {
            throw new Error('Action is required for add and modify operations.');
        }

        switch (opType) {
            case 'add':
                return await addCommand(input, action, authorID, notes);
            case 'remove':
                return await removeCommand(input);
            case 'modify':
                return await modifyCommand(input, action, notes);
            case 'read':
                if (source === 'cache') {
                    return await readFromCache(readType, input);
                } else if (source === 'mysql') {
                    return await readFromDatabaseWithRetry(readType, input);
                } else {
                    throw new Error(`Invalid source: ${source}`);
                }
            default:
                throw new Error(`Invalid operation type: ${opType}`);
        }
    } catch (err) {
        return logDetailedError('operation', 'database-operation.js', err, {
            opType,
            input,
            action,
            authorID,
            notes,
            readType,
            source,
        });
    }
}

function logDetailedError(functionName, fileName, error, variables) {
    const errorDetails = {
        status: 500,
        file: fileName,
        function: functionName,
        message: error.message,
        stack: error.stack,
        variables,
        timestamp: new Date().toISOString(),
    };

    console.error(chalk.red.bold(`[ERROR]`), chalk.yellow(`[${fileName}]`), chalk.cyan(`[${functionName}]`));
    console.error(chalk.red.bold('Message:'), error.message);
    console.error(chalk.red.bold('Stack Trace:'), error.stack);
    console.error(chalk.red.bold('Variables:'), JSON.stringify(variables, null, 2));
    console.error(chalk.red.bold('Timestamp:'), errorDetails.timestamp);

    return errorDetails; // Return the JSON response
}

async function addCommand(input, action, authorID, notes) {
    try {
        if (typeof action === 'object') {
            action = JSON.stringify(action);
        }
        if (!validateAction(action)) {
            throw new Error('Action must be a valid JSON string.');
        }

        const query = `INSERT INTO ${table} (word, action, authorID, notes, activations) VALUES (?, ?, ?, ?, ?)`;
        const params = [input, action, authorID || null, notes || null, null];

        console.log(`[INFO] Inserting into ${table}:`, params);

        return new Promise((resolve, reject) => {
            connection.query(query, params, async (err, results) => {
                if (err) {
                    return reject(logDetailedError('addCommand', 'database-operation.js', err, { query, params }));
                }
                console.log(chalk.green.bold('[SUCCESS]'), 'Command added successfully:', results);
                await updateCache();
                try {
                    await validateCache();
                } catch (validationError) {
                    logDetailedError('addCommand', 'database-operation.js', validationError, { query, params });
                }
                resolve(results);
            });
        });
    } catch (err) {
        throw logDetailedError('addCommand', 'database-operation.js', err, { input, action, authorID, notes });
    }
}

function validateAction(action) {
    try {
        JSON.parse(action);
        return true;
    } catch (err) {
        console.error('Invalid action JSON:', err.message);
        return false;
    }
}

async function removeCommand(input) {
    const query = `DELETE FROM ${table} WHERE word = ?`;
    const params = [input];

    return new Promise((resolve, reject) => {
        connection.query(query, params, async (err, results) => {
            if (err) {
                return reject(logDetailedError('removeCommand', 'database-operation.js', err, { query, params }));
            }
            console.log(chalk.green.bold('[SUCCESS]'), 'Command removed successfully:', results);
            await updateCache();
            try {
                await validateCache();
            } catch (validationError) {
                logDetailedError('removeCommand', 'database-operation.js', validationError, { query, params });
            }
            resolve(results);
        });
    });
}

async function modifyCommand(input, action, notes) {
    const query = `UPDATE ${table} SET action = ?, notes = ? WHERE word = ?`;
    const params = [action, notes, input];

    return new Promise((resolve, reject) => {
        connection.query(query, params, async (err, results) => {
            if (err) {
                return reject(logDetailedError('modifyCommand', 'database-operation.js', err, { query, params }));
            }
            console.log(chalk.green.bold('[SUCCESS]'), 'Command modified successfully:', results);
            await updateCache();
            resolve(results);
        });
    });
}

async function readFromCache(readType, input) {
    try {
        const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        let result;

        switch (readType) {
            case 'schema':
                result = cacheData;
                break;
            case 'keyword':
                if (input === null) {
                    result = cacheData.find((entry) => entry.word === input) || { status: 400, input, message: `Input Required For ${readType} Read` };
                    break;
                }
                result = cacheData.find((entry) => entry.word === input) || { status: 404, input, message: "Keyword Not Found" };
                break;
            case 'authorID':
                if (input === null) {
                    result = cacheData.find((entry) => entry.word === input) || { status: 400, input, message: `Input Required For ${readType} Read` };
                    break;
                }
                result = cacheData.filter((entry) => entry.authorID === input);
                break;
            default:
                throw new Error(`Invalid read type: ${readType}`);
        }

        console.log(chalk.green.bold('[SUCCESS]'), 'Read operation from cache successful.');
        return result;
    } catch (err) {
        throw logDetailedError('readFromCache', 'database-operation.js', err, { readType, input });
    }
}

async function readFromDatabaseWithRetry(readType, input, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await readFromDatabase(readType, input);
        } catch (err) {
            const errorDetails = logDetailedError('readFromDatabaseWithRetry', 'database-operation.js', err, { readType, input, attempt, retries });
            if (attempt === retries) {
                throw errorDetails;
            }
        }
    }
}

async function readFromDatabase(readType, input) {
    let query;
    let params = [];

    switch (readType) {
        case 'schema':
            query = `SELECT * FROM ${table}`;
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
                return reject(logDetailedError('readFromDatabase', 'database-operation.js', err, { query, params }));
            }
            console.log(chalk.green.bold('[SUCCESS]'), 'Read operation from database successful.');
            resolve(results);
        });
    });
}

module.exports = { operation };
