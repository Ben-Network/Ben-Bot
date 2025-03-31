const fs = require('fs');

module.exports = (client, modeConfig) => {
    modeConfig.logger.info('Debug Mode initialized.');

    if (modeConfig.replayLogFile) {
        modeConfig.logger.info(`Replaying interactions from log file: ${modeConfig.replayLogFile}`);
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
                modeConfig.logger.error('Error replaying interaction:', err);
            }
        });
    }
};