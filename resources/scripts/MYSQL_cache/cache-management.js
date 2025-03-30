const fs = require('fs');
const path = require('path');
const { cacheFilePath, maxBackupSizeMB, cacheBackupPath, analyticsFilePath } = require('./cache-config');

const backupDir = cacheBackupPath;
const lockFilePath = `${cacheFilePath}.lock`;

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

function monitorCache() {
  console.log('Monitoring cache file for changes...');
  fs.watch(cacheFilePath, (eventType) => {
    if (eventType === 'change') {
      console.log('Cache file modified:', new Date().toISOString());
      createCacheBackup();
    }
  });
}

function createCacheBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFilePath = path.join(backupDir, `cache-backup-${timestamp}.json`);

  fs.copyFile(cacheFilePath, backupFilePath, (err) => {
    if (err) {
      console.error('Error creating cache backup:', err.message);
    } else {
      console.log('Cache backup created at:', backupFilePath);
      truncateOldBackups();
    }
  });
}

function listCacheBackups() {
  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error('Error reading backup directory:', err.message);
      return;
    }
    console.log('Available backups:');
    files.forEach((file) => console.log(file));
  });
}

function restoreCacheBackup(backupFileName) {
  const backupFilePath = path.join(backupDir, backupFileName);

  fs.copyFile(backupFilePath, cacheFilePath, (err) => {
    if (err) {
      console.error('Error restoring cache backup:', err.message);
    } else {
      console.log('Cache restored from backup:', backupFileName);
    }
  });
}

function acquireLock() {
  if (fs.existsSync(lockFilePath)) {
    console.error('Cache is locked. Another process may be using it.');
    return false;
  }
  fs.writeFileSync(lockFilePath, 'LOCKED');
  console.log('Cache lock acquired.');
  return true;
}

function releaseLock() {
  if (fs.existsSync(lockFilePath)) {
    fs.unlinkSync(lockFilePath);
    console.log('Cache lock released.');
  }
}

function trackCacheUsage(type) {
  let analytics = { hits: 0, misses: 0, lookups: 0 };

  if (fs.existsSync(analyticsFilePath)) {
    const data = fs.readFileSync(analyticsFilePath, 'utf8');
    analytics = JSON.parse(data);
  }

  analytics[type]++;
  fs.writeFileSync(analyticsFilePath, JSON.stringify(analytics, null, 2));
  console.log(`Cache ${type} recorded.`);
}

function displayCacheAnalytics() {
  if (!fs.existsSync(analyticsFilePath)) {
    console.log('No analytics data available.');
    return;
  }

  const analytics = JSON.parse(fs.readFileSync(analyticsFilePath, 'utf8'));
  console.log('Cache Usage Analytics:', analytics);
}

function dumpCacheContents() {
  if (!fs.existsSync(cacheFilePath)) {
    console.error('Cache file does not exist.');
    return;
  }

  const cacheData = fs.readFileSync(cacheFilePath, 'utf8');
  console.log('Cache Contents:', JSON.parse(cacheData));
}

function getDirectorySize(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  return files.reduce((total, file) => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    return total + stats.size;
  }, 0);
}

function truncateOldBackups() {
  const maxSizeBytes = maxBackupSizeMB * 1024 * 1024;
  let totalSize = getDirectorySize(backupDir);

  if (totalSize > maxSizeBytes) {
    console.log('Backup size exceeds limit. Truncating old backups...');
    const files = fs.readdirSync(backupDir)
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(backupDir, file)).mtime.getTime(),
      }))
      .sort((a, b) => a.time - b.time);

    for (const file of files) {
      if (totalSize <= maxSizeBytes) break;
      const filePath = path.join(backupDir, file.name);
      const fileSize = fs.statSync(filePath).size;
      fs.unlinkSync(filePath);
      totalSize -= fileSize;
      console.log(`Deleted old backup: ${file.name}`);
    }
  }
}

module.exports = {
  trackCacheUsage,
  monitorCache,
  createCacheBackup,
  listCacheBackups,
  restoreCacheBackup,
  acquireLock,
  releaseLock,
  displayCacheAnalytics,
  dumpCacheContents,
};