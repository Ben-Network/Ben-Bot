const { info, error } = require('../resources/scripts/logger');

function startProductionMode() {
    try {
        info('Starting production mode...');
        const { commandsCollection } = require('../command-handler');
        info('Production Mode initialized.');
    } catch (err) {
        error(`Error in production mode: ${err.message}`);
    }
}

module.exports = { startProductionMode };