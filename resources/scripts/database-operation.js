import MYSQLpkg from 'mysql2/promise';
const { createConnection, mysql } = MYSQLpkg;
import { readFileSync } from 'fs';
import { dbConfig, cacheFilePath, table } from './MYSQL_cache/cache-config.js';
import updateCache from './MYSQL_cache/cache-update.js';
import { validateCache } from './MYSQL_cache/cache-updateCacheintegrity-check.js';
import { info, error } from './logger.js';

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

    error(`[${fileName}] [${functionName}] Message: ${error.message}`);
    error(`[${fileName}] [${functionName}] Stack Trace: ${error.stack}`);
    error(`[${fileName}] [${functionName}] Variables: ${JSON.stringify(variables, null, 2)}`);
    error(`[${fileName}] [${functionName}] Timestamp: ${errorDetails.timestamp}`);

    return errorDetails;
}

async function testDatabaseConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.ping();
        info('[INFO] Database connection successful.');
        await connection.end();
    } catch (err) {
        error(`[ERROR] Database connection failed: ${err.message}`);
        throw err;
    }
}

async function operation({ opType, input, action, authorID, notes, readType, source }) {
    try {
        if (!opType) {
            throw new Error('Operation type (opType) is required.');
        }

        const operationHandlers = {
            add: () => addCommand(input, action, authorID, notes),
            remove: () => removeCommand(input),
            modify: () => modifyCommand(input, action, notes),
            read: () => handleReadOperation(source, readType, input),
        };

        if (!operationHandlers[opType]) {
            throw new Error(`Invalid operation type: ${opType}`);
        }

        return await operationHandlers[opType]();
    } catch (err) {
        error(`Error in operation: ${err.message}`);
        throw err;
    }
}



async function handleReadOperation(source, readType, input) {
    if (source === 'cache') {
        return await readFromCache(readType, input);
    } else if (source === 'mysql') {
        return await readFromDatabaseWithRetry(readType, input);
    } else {
        throw new Error(`Invalid source: ${source}`);
    }
}

async function addCommand(input, action, authorID, notes) {
    try {
        action = prepareAction(action);
        const params = prepareInsertParams(input, action, authorID, notes);
        const query = `INSERT INTO ${table} (word, action, authorID, notes, activations) VALUES (?, ?, ?, ?, ?)`;

        info(`Inserting into ${table}: ${JSON.stringify(params)}`);
        const results = await executeInsertQuery(query, params);
        await handleCacheUpdates();
        return results;
    } catch (err) {
        throw logDetailedError('addCommand', 'database-operation.js', err, { input, action, authorID, notes });
    }
}

function prepareAction(action) {
    if (typeof action === 'object') {
        action = JSON.stringify(action);
    }
    if (!validateAction(action)) {
        throw new Error('Action must be a valid JSON string.');
    }
    return action;
}

function prepareInsertParams(input, action, authorID, notes) {
    return [input, action, authorID || null, notes || null, null];
}

async function executeInsertQuery(query, params) {
    const connection = await createConnection(dbConfig);
    try {
        const [results] = await connection.query(query, params);
        info(`Command added successfully: ${results}`);
        return results;
    } catch (err) {
        throw logDetailedError('executeInsertQuery', 'database-operation.js', err, { query, params });
    } finally {
        await connection.end();
    }
}

async function handleCacheUpdates() {
    await updateCache();
    try {
        await validateCache();
    } catch (validationError) {
        logDetailedError('handleCacheUpdates', 'database-operation.js', validationError, {});
    }
}

function validateAction(action) {
    try {
        JSON.parse(action);
        return true;
    } catch (err) {
        error(`Invalid action JSON: ${err.message}`);
        return false;
    }
}

async function removeCommand(input) {
    const query = `DELETE FROM ${table} WHERE word = ?`;
    const params = [input];
    const connection = await createConnection(dbConfig);
    try {
        const [results] = await connection.query(query, params);
        info(`Command removed successfully: ${results}`);
        await updateCache();
        try {
            await validateCache();
        } catch (validationError) {
            logDetailedError('removeCommand', 'database-operation.js', validationError, { query, params });
        }
        return results;
    } catch (err) {
        throw logDetailedError('removeCommand', 'database-operation.js', err, { query, params });
    } finally {
        await connection.end();
    }
}

async function modifyCommand(input, action, notes) {
    const query = `UPDATE ${table} SET action = ?, notes = ? WHERE word = ?`;
    const connection = await createConnection(dbConfig);
    const params = [input, action, notes];
    try {
        const [results] = await connection.query(query, params);
        info(`Command modified successfully: ${results}`);
        await updateCache();
        return results;
    } catch (err) {
        throw logDetailedError('modifyCommand', 'database-operation.js', err, { query, params });
    } finally {
        await connection.end();
    }
}

async function readFromCache(readType, input) {
    try {
        const cacheData = JSON.parse(readFileSync(cacheFilePath, 'utf8'));
        return await readFromCacheHelper(readType, input, cacheData);
    } catch (err) {
        throw logDetailedError('readFromCache', 'database-operation.js', err, { readType, input });
    }
}

async function readFromCacheHelper(readType, input, cacheData) {
    let result;

    switch (readType) {
        case 'schema':
            result = cacheData;
            break;
        case 'keyword':
            result = readKeywordFromCache(input, cacheData);
            break;
        case 'authorID':
            result = readAuthorIDFromCache(input, cacheData);
            break;
        default:
            throw new Error(`Invalid read type: ${readType}`);
    }

    info('Read operation from cache successful.');
    return result;
}

function readKeywordFromCache(input, cacheData) {
    if (input === null) {
        return { status: 400, input, message: `Input Required For keyword Read` };
    }
    return cacheData.find((entry) => entry.word === input) || { status: 404, input, message: "Keyword Not Found" };
}

function readAuthorIDFromCache(input, cacheData) {
    if (input === null) {
        return { status: 400, input, message: `Input Required For authorID Read` };
    }
    return cacheData.filter((entry) => entry.authorID === input);
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

    const connection = await createConnection(dbConfig);
    try {
        const [results] = await connection.query(query, params);
        info('Read operation from database successful.');
        return results;
    } catch (err) {
        throw logDetailedError('readFromDatabase', 'database-operation.js', err, { query, params });
    } finally {
        await connection.end();
    }
}

export { operation, testDatabaseConnection };
