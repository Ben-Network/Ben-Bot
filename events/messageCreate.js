const fs = require('fs');
const path = require('path');
const processActivations = require('../resources/scripts/process-activations');
const { info, warn, error } = require('../resources/scripts/logger');

const ignoreFilePath = path.join(__dirname, '../resources/data/ignored-users.json');

// Cooldown stuff, nuggets kept spamming it and lagged out my whole damn computer.
let globalVariables = {
    lastMSGRunTime: 0,
    GlobalCooldownTime: 5000, // should I make this configurable in env?
};

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        info(`messageCreate event triggered by user: ${message.author.id}`);

        if (message.author.bot) {
            info(`This... This is a bot's message. We don't reply to these.`);
            return;
        }

        if (isUserIgnored(message.author.id)) {
            warn(`User ${message.author.id} is opted out so we gon stop this right here :>.`);
            return;
        }

        const currentTime = Date.now();

        if (currentTime - globalVariables.lastMSGRunTime < globalVariables.GlobalCooldownTime) {
            info('CHILL YOUR BALLSACK');
            return;
        }

        const result = await processActivations(message.content);
        if (!result || !result.action?.type || !result.action?.content) {
            warn('No keyword match found. Better luck next time.');
            return;
        }

        globalVariables.lastMSGRunTime = currentTime;
        const { type, content } = result.action;

        try {
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
                    throw new Error(`Unknown activation type: ${type}. Who wrote this?`);
            }
        } catch (err) {
            error(`Failed to send activation response: ${err.message}`);
        }
    },
};

function isUserIgnored(userId) {
    // Load the ignore list. If the user is in it, we ignore them.
    const ignoredUsers = JSON.parse(fs.readFileSync(ignoreFilePath, 'utf8') || '{}');
    return ignoredUsers[userId] === true;
}