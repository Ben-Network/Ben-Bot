require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { commandsCollection, registerEventHandlers } = require('./command-handler');
const { modeConfig } = require('./modes/modeConfig');
const { info, error } = require('./resources/scripts/logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

try {
    modeConfig.logger.info(`Bot starting in ${modeConfig.mode} mode...`);

    registerEventHandlers(client);

    info('Bot initialized successfully.');

    client.login(process.env.BOTTOKEN);
} catch (err) {
    error(`Error during bot initialization: ${err.message}`);
    process.exit(1);
}