import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { info, error } from '../logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbConfig = {
    host: process.env.BENBOT_HOST,
    user: process.env.BENBOT_USER,
    password: process.env.BENBOT_PASSWORD,
    database: process.env.BENBOT_DATABASE,
    port: process.env.BENBOT_PORT || 3306,
};

if (!dbConfig.user) {
    error('Database user is not set. Check your .env file.');
} else {
    info(`Database user loaded: ${dbConfig.user}`);
}

info(
    `Database connection details: ${JSON.stringify({
        host: dbConfig.host,
        user: dbConfig.user,
        database: dbConfig.database,
    })}`
);

export default {
    dbConfig,
    table: process.env.BENBOT_TABLE,
    cacheFilePath: path.join(__dirname, '../../cache/cache.json'),
    cacheBackupsPath: path.join(__dirname, '../../cache/cache-backups'),
    analyticsFilePath: path.join(__dirname, '../../cache/cache-analytics.json'),
    maxBackupSizeMB: 10,
};
