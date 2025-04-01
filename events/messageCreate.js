const fs = require('fs');
const path = require('path');
const processActivations = require('../resources/scripts/process-activations');

const ignoreFilePath = path.join(__dirname, '../resources/data/ignored-users.json');

// Global variables for cooldown management
let globalVariables = {
    lastMSGRunTime: 0,
    GlobalCooldownTime: 5000, // Default 5 seconds, adjust as needed
};

module.exports = {
    name: 'messageCreate', // Event name for the messageCreate event
    async execute(message) {
        console.log(`[DEBUG] messageCreate event triggered by user: ${message.author.id}`);

        // Ignore bot messages
        if (message.author.bot) {
            console.log('[DEBUG] Ignored bot message.');
            return;
        }

        const currentTime = Date.now();

        // Check cooldown
        if (currentTime - globalVariables.lastMSGRunTime < globalVariables.GlobalCooldownTime) {
            console.log('[DEBUG] Cooldown active. Ignoring message.');
            return;
        }

        // Check if user is ignored
        const isIgnored = getMemberData(message.author.id);
        if (isIgnored) {
            console.log(`[DEBUG] User ${message.author.id} is ignored.`);
            return;
        }

        // Process activations
        const result = await processActivations(message.content);
        if (!result) {
            console.log('[DEBUG] No activation matched the message.');
            return;
        }

        // Handle result
        globalVariables.lastMSGRunTime = currentTime;
        const { type, content } = result;

        console.log(`[DEBUG] Activation matched. Type: ${type}, Content: ${content}`);

        switch (type) {
            case 'txt':
                await message.channel.send(content);
                break;
            case 'Lfile':
                await message.channel.send({ files: [content] });
                break;
            case 'Wfile':
                await message.channel.send(content);
                break;
            default:
                console.error(`[ERROR] Unknown activation type: ${type}`);
        }
    },
};

function getMemberData(userId) {
    if (!fs.existsSync(ignoreFilePath)) return false;
    const ignoredUsers = JSON.parse(fs.readFileSync(ignoreFilePath, 'utf8'));
    return ignoredUsers[userId] === true;
}