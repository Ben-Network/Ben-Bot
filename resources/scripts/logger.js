const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../' + (process.env.LOG_FILE || 'bot.log'));
const logToConsole = process.env.LOG_TO_CONSOLE === 'true';
const logToFile = process.env.LOG_TO_FILE === 'true';
const botMode = process.env.BOT_MODE || 'production';
const haltOnError = process.env.HALT_ON_ERROR === 'true';

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const formattedMessage = formatLogMessage(timestamp, level, message);

    writeToFile(formattedMessage);
    writeToConsole(formattedMessage, level);
    handleCriticalError(level);
}

function formatLogMessage(timestamp, level, message) {
    return `[${timestamp}] [${level}] ${message}`;
}

function writeToFile(formattedMessage) {
    if (logToFile) {
        fs.appendFileSync(logFilePath, `${formattedMessage}\n`, 'utf8');
    }
}

function writeToConsole(formattedMessage, level) {
    if (shouldLogToConsole(level)) {
        console.log(formattedMessage);
    }
}

function handleCriticalError(level) {
    if (haltOnError && level === 'CRITICAL') {
        console.error('[CRITICAL] Halting execution due to a critical error.');
        process.exit(1);
    }
}

function shouldLogToConsole(level) {
    return botMode === 'debug' || (logToConsole && botMode === 'production' && ['ERROR', 'WARN', 'CRITICAL', 'SUCCESS'].includes(level));
}

function error(message) {
    log(message, 'ERROR');
}

function warn(message) {
    log(message, 'WARN');
}

function info(message) {
    log(message, 'INFO');
}

function critical(message) {
    log(message, 'CRITICAL');
}

function success(message) {
    log(message, 'SUCCESS');
}

module.exports = { log, error, warn, info, critical, success };
