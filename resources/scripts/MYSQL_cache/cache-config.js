require('dotenv').config();
const path = require('path');
const { info, error } = require('../logger');

const dbConfig = {
    host: process.env.BENBOT_HOST,
    user: process.env.BENBOT_USER,
    password: process.env.BENBOT_PASSWORD,
    database: process.env.BENBOT_DATABASE,
};

if (!dbConfig.user) {
    error('Database user is not set. Check your .env file.');
} else {
    info(`Database user loaded: ${dbConfig.user}`);
}

info(`Database connection details: ${JSON.stringify({ host: dbConfig.host, user: dbConfig.user, database: dbConfig.database })}`);

module.exports = {
    dbConfig,
    table: process.env.BENBOT_TABLE,
    cacheFilePath: path.join(__dirname, '../../cache/cache.json'),
    cacheBackupsPath: path.join(__dirname, '../../cache/cache-backups'),
    analyticsFilePath: path.join(__dirname, '../../cache/cache-analytics.json'),
    maxBackupSizeMB: 10,
};