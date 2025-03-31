const dotenv = require('dotenv');
const winston = require('winston');

// Load environment variables
dotenv.config();

const BOT_MODE = process.env.BOT_MODE || 'production'; // Default to production mode
const LOG_TO_CONSOLE = process.env.LOG_TO_CONSOLE === 'true';
const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';
const HALT_ON_ERROR = process.env.HALT_ON_ERROR === 'true';
const REPLAY_LOG_FILE = process.env.REPLAY_LOG_FILE || null;

// Validate BOT_MODE
const validModes = ['interactive', 'debug', 'production'];
if (!validModes.includes(BOT_MODE)) {
    console.error(`Invalid BOT_MODE: ${BOT_MODE}. Defaulting to 'production'.`);
}

// Configure logging
const logger = winston.createLogger({
    level: BOT_MODE === 'debug' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
        })
    ),
    transports: [
        ...(LOG_TO_CONSOLE ? [new winston.transports.Console()] : []),
        ...(LOG_TO_FILE ? [new winston.transports.File({ filename: 'bot.log' })] : [])
    ]
});

// Mode-specific behavior
const modeConfig = {
    mode: BOT_MODE,
    isInteractive: BOT_MODE === 'interactive',
    isDebug: BOT_MODE === 'debug',
    isProduction: BOT_MODE === 'production',
    logger,
    haltOnError: HALT_ON_ERROR,
    replayLogFile: REPLAY_LOG_FILE
};

module.exports = modeConfig;