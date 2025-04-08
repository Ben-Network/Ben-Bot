require('dotenv').config();
const path = require('path');
const { info, error } = require('../logger');

module.exports = {
    dbConfig: {
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    },
    table: process.env.TABLE,

    cacheFilePath: path.join(__dirname, '../../cache/cache.json'),
    cacheBackupsPath: path.join(__dirname, '../../cache/cache-backups'),
    analyticsFilePath: path.join(__dirname, '../../cache/cache-analytics.json'),
    maxBackupSizeMB: 10,
};