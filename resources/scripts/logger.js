const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/app.log');
const logToConsole = process.env.LOG_TO_CONSOLE === 'true';
const logToFile = process.env.LOG_TO_FILE === 'true';

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    if (logToConsole) {
        console.log(formattedMessage);
    }

    if (logToFile) {
        fs.appendFileSync(logFilePath, `${formattedMessage}\n`, 'utf8');
    }
}

function error(message) {
    log(message, 'ERROR');
}

function info(message) {
    log(message, 'INFO');
}

function warn(message) {
    log(message, 'WARN');
}

module.exports = { log, error, info, warn };
