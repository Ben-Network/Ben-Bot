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

        if (this.isBotMessage(message)) return;
        if (this.isUserIgnored(message.author.id)) return;
        if (this.isOnCooldown()) return;

        const result = await this.processMessage(message);
        if (this.isInvalidResult(result)) return;

        globalVariables.lastMSGRunTime = Date.now();

        try {
            await this.sendActivationResponse(message, result.action.type, result.action.content);
        } catch (err) {
            error(`Failed to send activation response: ${err.message}`);
        }
    },

    isBotMessage(message) {
        if (message.author.bot) {
            info(`This... This is a bot's message. We don't reply to these.`);
            return true;
        }
        return false;
    },

    isUserIgnored(userId) {
        const ignoredUsers = this.loadIgnoredUsers();
        if (ignoredUsers[userId]) {
            info(`User ${userId} is opted out so we gon stop this right here :>.`);
            return true;
        }
        return false;
    },

    isOnCooldown() {
        const currentTime = Date.now();
        if (currentTime - globalVariables.lastMSGRunTime < globalVariables.GlobalCooldownTime) {
            info('CHILL YOUR BALLSACK');
            return true;
        }
        return false;
    },

    isInvalidResult(result) {
        if (this.isResultInvalid(result)) {
            warn('No keyword match found. Better luck next time.');
            return true;
        }
        return false;
    },

    isResultInvalid(result) {
        return !result || !result.action?.type || !result.action?.content;
    },

    async processMessage(message) {
        return await processActivations(message.content);
    },

    async sendActivationResponse(message, type, content) {
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
    },

    loadIgnoredUsers() {
        if (!fs.existsSync(ignoreFilePath)) {
            info('Ignore file not found. Creating a new one.');
            return {};
        }
        const data = fs.readFileSync(ignoreFilePath, 'utf8');
        info('Ignore file loaded successfully.');
        return JSON.parse(data);
    },
};