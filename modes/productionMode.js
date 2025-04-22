import { info, error } from '../resources/scripts/logger.js';
import { commandsCollection } from '../command-handler.js'; // Move require to the top

function startProductionMode() {
    try {
        info('Starting production mode...');
        commandsCollection()
        info('Production Mode initialized.');
    } catch (err) {
        error(`Error in production mode: ${err.message}`);
    }
}

export { startProductionMode };
