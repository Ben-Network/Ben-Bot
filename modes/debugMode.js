const fs = require('fs');
const { info, error } = require('../resources/scripts/logger');

function startDebugMode(client, modeConfig) {
    try {
        info('Debug Mode initialized.');

        if (modeConfig.replayLogFile) {
            info(`Replaying interactions from log file: ${modeConfig.replayLogFile}`);
            
            if (!fs.existsSync(modeConfig.replayLogFile)) {
                error(`[ERROR] Replay log file not found: ${modeConfig.replayLogFile}`);
                return;
            }

            const logData = fs.readFileSync(modeConfig.replayLogFile, 'utf-8');
            const interactions = JSON.parse(logData);

            interactions.forEach(async (interactionData) => {
                try {
                    const command = client.commands.get(interactionData.commandName);
                    if (command) {
                        await command.execute(interactionData);
                    } else {
                        modeConfig.logger.warn(`Unknown command in log: ${interactionData.commandName}`);
                    }
                } catch (err) {
                    error(`Error replaying interaction: ${err}`);
                }
            });
        }
    } catch (err) {
        error(`Error in debug mode: ${err.message}`);
    }
}

module.exports = { startDebugMode };