// This bot is a shit show, I can't wait to write the documentation for it :D
import { existsSync, mkdirSync, watch, copyFileSync, readdirSync, statSync, unlinkSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { cacheFilePath, maxBackupSizeMB, cacheBackupPath, analyticsFilePath } from './cache-config.js';
import { info, error } from '../logger.js';

const backupDir = cacheBackupPath;
const lockFilePath = `${cacheFilePath}.lock`;

if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
}

function monitorCache() {
    info('Monitoring cache file for changes...');
    watch(cacheFilePath, (eventType) => {
        if (eventType === 'change') {
            info(`Cache file modified: %{new Date().toISOString()}`);
            createCacheBackup();
        }
    });
}

function createCacheBackup() {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFilePath = join(cacheBackupPath, `cache-backup-${timestamp}.json`);

        copyFileSync(cacheFilePath, backupFilePath);
        info(`[SUCCESS] Cache backup created at: ${backupFilePath}`);
        truncateOldBackups();
    } catch (err) {
        error(`[ERROR] Failed to create cache backup: ${err.message}`);
    }
}

function truncateOldBackups() {
    try {
        const files = readdirSync(cacheBackupPath)
            .map(file => ({
                name: file,
                time: statSync(join(cacheBackupPath, file)).mtime.getTime(),
            }))
            .sort((a, b) => a.time - b.time);

        let totalSize = files.reduce((sum, file) => sum + statSync(join(cacheBackupPath, file.name)).size, 0);
        const maxSizeBytes = maxBackupSizeMB * 1024 * 1024;

        for (const file of files) {
            if (totalSize <= maxSizeBytes) break;
            const filePath = join(cacheBackupPath, file.name);
            totalSize -= statSync(filePath).size;
            unlinkSync(filePath);
            info(`[INFO] Deleted old backup: ${file.name}`);
        }
    } catch (err) {
        error(`[ERROR] Failed to truncate old backups: ${err.message}`);
    }
}

function listCacheBackups() {
    try {
        const files = readdirSync(backupDir);
        info('Available backups:');
        files.forEach(file => info(file));
    } catch (err) {
        error(`[ERROR] Failed to list cache backups: ${err.message}`);
    }
}

function restoreCacheBackup(backupFileName) {
    try {
        const backupFilePath = join(backupDir, backupFileName);
        copyFileSync(backupFilePath, cacheFilePath);
        info(`[SUCCESS] Cache restored from backup: ${backupFileName}`);
    } catch (err) {
        error(`[ERROR] Failed to restore cache backup: ${err.message}`);
    }
}

function acquireLock() {
    if (existsSync(lockFilePath)) {
        error('Cache is locked. Another process may be using it.');
        return false;
    }
    writeFileSync(lockFilePath, 'LOCKED');
    info('Cache lock acquired.');
    return true;
}

function releaseLock() {
    if (existsSync(lockFilePath)) {
        unlinkSync(lockFilePath);
        info('Cache lock released.');
    }
}

function trackCacheUsage(type) {
    try {
        let analytics = { hits: 0, misses: 0, lookups: 0 };

        if (existsSync(analyticsFilePath)) {
            const data = readFileSync(analyticsFilePath, 'utf8');
            analytics = JSON.parse(data);
        }

        analytics[type]++;
        writeFileSync(analyticsFilePath, JSON.stringify(analytics, null, 2));
        info(`Cache ${type} recorded.`);
    } catch (err) {
        error(`[ERROR] Failed to track cache usage: ${err.message}`);
    }
}

function displayCacheAnalytics() {
    try {
        if (!existsSync(analyticsFilePath)) {
            info('No analytics data available.');
            return;
        }

        const analytics = JSON.parse(readFileSync(analyticsFilePath, 'utf8'));
        info(`Cache Usage Analytics: ${analytics}`);
    } catch (err) {
        error(`[ERROR] Failed to display cache analytics: ${err.message}`);
    }
}

function dumpCacheContents() {
    try {
        if (!existsSync(cacheFilePath)) {
            error('Cache file does not exist.');
            return;
        }

        const cacheData = readFileSync(cacheFilePath, 'utf8');
        info(`Cache Contents: ${JSON.parse(cacheData)}`);
    } catch (err) {
        error(`[ERROR] Failed to dump cache contents: ${err.message}`);
    }
}

export {
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