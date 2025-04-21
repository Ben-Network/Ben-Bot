import { existsSync, readFileSync } from 'fs';
import { info, error } from '../resources/scripts/logger.js';

function startDebugMode(client, modeConfig) {
    try {
        info('Debug Mode initialized.');

        if (modeConfig.replayLogFile) {
            info(`Replaying interactions from log file: ${modeConfig.replayLogFile}`);
            
            if (!existsSync(modeConfig.replayLogFile)) {
                error(`[ERROR] Replay log file not found: ${modeConfig.replayLogFile}`);
                return;
            }

            const logData = readFileSync(modeConfig.replayLogFile, 'utf-8');
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
export { startDebugMode };
