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
    shards: 'auto', // I just shardded my pants
});

client.on('interactionCreate', async (interaction) => {
    console.log(`[DEBUG] Interaction received: ${interaction.commandName}`); // Debug log

    if (!interaction.isCommand()) return;

    const command = commandsCollection.get(interaction.commandName);

    if (!command) {
        console.error(`[ERROR] Command not found: ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(`[ERROR] Failed to execute command: ${interaction.commandName}`, err);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
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