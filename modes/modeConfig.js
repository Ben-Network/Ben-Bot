import { config } from 'dotenv';
import { createLogger, format as _format, transports as _transports } from 'winston';

config();

const BOT_MODE = process.env.BOT_MODE || 'production';
const LOG_TO_CONSOLE = process.env.LOG_TO_CONSOLE === 'true';
const LOG_TO_FILE = process.env.LOG_TO_FILE === 'true';
const HALT_ON_ERROR = process.env.HALT_ON_ERROR === 'true';
const REPLAY_LOG_FILE = process.env.REPLAY_LOG_FILE || null;

const validModes = ['interactive', 'debug', 'production'];
if (!validModes.includes(BOT_MODE)) {
    console.error(`[ERROR] Invalid BOT_MODE: ${BOT_MODE}. Defaulting to 'production'.`);
}

const logger = createLogger({
    level: BOT_MODE === 'debug' ? 'debug' : 'info',
    format: _format.combine(
        _format.timestamp(),
        _format.printf(({ timestamp, level, message }) => `[${timestamp}] [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        ...(LOG_TO_CONSOLE ? [new _transports.Console()] : []),
        ...(LOG_TO_FILE ? [new _transports.File({ filename: process.env.LOG_FILE || 'bot.log' })] : [])
    ]
});

const modeConfig = {
    mode: BOT_MODE,
    isInteractive: BOT_MODE === 'interactive',
    isDebug: BOT_MODE === 'debug',
    isProduction: BOT_MODE === 'production',
    logger,
    haltOnError: HALT_ON_ERROR,
    replayLogFile: REPLAY_LOG_FILE
};

function configureMode(mode = BOT_MODE) {
    const modeActions = {
        interactive: () => {
            logger.info('Interactive mode enabled. Bot will run with user prompts.');
            logger.level = 'debug';
        },
        debug: () => {
            logger.info('Debug mode enabled. Detailed logs will be shown.');
            logger.level = 'debug';
        },
        production: () => {
            logger.info('Production mode enabled. Running with optimized settings.');
            logger.level = 'info';
        },
        default: () => {
            logger.error(`Unknown mode: ${mode}. Defaulting to production.`);
            logger.level = 'info';
        }
    };

    try {
        logger.info(`Configuring mode: ${mode}`);
        (modeActions[mode] || modeActions.default)();
    } catch (err) {
        logger.error(`Failed to configure mode: ${err.message}`);
        if (HALT_ON_ERROR) {
            throw err;
        }
    }
}

export { configureMode, modeConfig };