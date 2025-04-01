const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Events } = require('discord.js');
const modeConfig = require('./modes/modeConfig'); // Import mode configuration
const { commandsCollection, registerEventHandlers } = require('./command-handler'); // Import commands and event handlers from command-handler.js
require('dotenv').config();
const token = process.env.BOTTOKEN;

// Initialize the bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Register event handlers
registerEventHandlers(client);

// Attach commands to the client
client.commands = commandsCollection;

// Log the current mode
modeConfig.logger.info(`Bot starting in ${modeConfig.mode} mode...`);

// Mode-specific behavior
if (modeConfig.isInteractive) {
    modeConfig.logger.info('Running in Interactive Terminal Mode...');
    require('./modes/interactiveMode')(client, modeConfig);
} else if (modeConfig.isDebug) {
    modeConfig.logger.info('Running in Debug Mode...');
    require('./modes/debugMode')(client, modeConfig);
} else if (modeConfig.isProduction) {
    modeConfig.logger.info('Running in Production Mode...');
    require('./modes/productionMode')(client, modeConfig);
}

// Set up interaction event handling
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        modeConfig.logger.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        modeConfig.logger.error(`Error executing command ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, () => {
    modeConfig.logger.info(`Ready! Logged in as ${client.user.tag}`);
});

// Handle bot login
client.login(token).catch(err => {
    modeConfig.logger.error('Failed to log in:', err);
    if (modeConfig.haltOnError) process.exit(1);
});