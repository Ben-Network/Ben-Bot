// This bot is a shit show, I can't wait to write the documentation for it :D
const fs = require('fs');
const path = require('path');
const { cacheFilePath, maxBackupSizeMB, cacheBackupPath, analyticsFilePath } = require('./cache-config');
const { info, error } = require('../logger');

const backupDir = cacheBackupPath;
const lockFilePath = `${cacheFilePath}.lock`;

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

function monitorCache() {
    info('Monitoring cache file for changes...');
    fs.watch(cacheFilePath, (eventType) => {
        if (eventType === 'change') {
            info('Cache file modified:', new Date().toISOString());
            createCacheBackup();
        }
    });
}

function createCacheBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilePath = path.join(cacheBackupPath, `cache-backup-${timestamp}.json`);

        fs.copyFileSync(cacheFilePath, backupFilePath);
        info(`[SUCCESS] Cache backup created at: ${backupFilePath}`);
        truncateOldBackups();
    } catch (err) {
        error(`[ERROR] Failed to create cache backup: ${err.message}`);
    }
}

function truncateOldBackups() {
    try {
        const files = fs.readdirSync(cacheBackupPath)
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(cacheBackupPath, file)).mtime.getTime(),
            }))
            .sort((a, b) => a.time - b.time);

        let totalSize = files.reduce((sum, file) => sum + fs.statSync(path.join(cacheBackupPath, file.name)).size, 0);
        const maxSizeBytes = maxBackupSizeMB * 1024 * 1024;

        for (const file of files) {
            if (totalSize <= maxSizeBytes) break;
            const filePath = path.join(cacheBackupPath, file.name);
            totalSize -= fs.statSync(filePath).size;
            fs.unlinkSync(filePath);
            info(`[INFO] Deleted old backup: ${file.name}`);
        }
    } catch (err) {
        error(`[ERROR] Failed to truncate old backups: ${err.message}`);
    }
}

function listCacheBackups() {
    try {
        const files = fs.readdirSync(backupDir);
        info('Available backups:');
        files.forEach(file => info(file));
    } catch (err) {
        error(`[ERROR] Failed to list cache backups: ${err.message}`);
    }
}

function restoreCacheBackup(backupFileName) {
    try {
        const backupFilePath = path.join(backupDir, backupFileName);
        fs.copyFileSync(backupFilePath, cacheFilePath);
        info(`[SUCCESS] Cache restored from backup: ${backupFileName}`);
    } catch (err) {
        error(`[ERROR] Failed to restore cache backup: ${err.message}`);
    }
}

function acquireLock() {
    if (fs.existsSync(lockFilePath)) {
        error('Cache is locked. Another process may be using it.');
        return false;
    }
    fs.writeFileSync(lockFilePath, 'LOCKED');
    info('Cache lock acquired.');
    return true;
}

function releaseLock() {
    if (fs.existsSync(lockFilePath)) {
        fs.unlinkSync(lockFilePath);
        info('Cache lock released.');
    }
}

function trackCacheUsage(type) {
    try {
        let analytics = { hits: 0, misses: 0, lookups: 0 };

        if (fs.existsSync(analyticsFilePath)) {
            const data = fs.readFileSync(analyticsFilePath, 'utf8');
            analytics = JSON.parse(data);
        }

        analytics[type]++;
        fs.writeFileSync(analyticsFilePath, JSON.stringify(analytics, null, 2));
        info(`Cache ${type} recorded.`);
    } catch (err) {
        error(`[ERROR] Failed to track cache usage: ${err.message}`);
    }
}

function displayCacheAnalytics() {
    try {
        if (!fs.existsSync(analyticsFilePath)) {
            info('No analytics data available.');
            return;
        }

        const analytics = JSON.parse(fs.readFileSync(analyticsFilePath, 'utf8'));
        info('Cache Usage Analytics:', analytics);
    } catch (err) {
        error(`[ERROR] Failed to display cache analytics: ${err.message}`);
    }
}

function dumpCacheContents() {
    try {
        if (!fs.existsSync(cacheFilePath)) {
            error('Cache file does not exist.');
            return;
        }

        const cacheData = fs.readFileSync(cacheFilePath, 'utf8');
        info('Cache Contents:', JSON.parse(cacheData));
    } catch (err) {
        error(`[ERROR] Failed to dump cache contents: ${err.message}`);
    }
}

module.exports = {
    monitorCache,
    createCacheBackup,
    truncateOldBackups,
    listCacheBackups,
    restoreCacheBackup,
    acquireLock,
    releaseLock,
    trackCacheUsage,
    displayCacheAnalytics,
    dumpCacheContents,
};