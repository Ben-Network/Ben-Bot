import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { commandsCollection, registerEventHandlers } from './command-handler.js';
import { configureMode, modeConfig } from './modes/modeConfig.js';
import { info, error } from './resources/scripts/logger.js';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});


client.on('ready', async () => {
    try {
        const startTime = Date.now();
        console.log(`[DEBUG] Shard initialization started.`);

        const shardId = client.shard?.ids[0] ?? 'N/A';

        if (client.shard) {
            await client.shard.broadcastEval(() => this.readyAt !== null);
        } else {
            console.error('[ERROR] Shard manager is not available.');
            process.exit(1);
        }

        const totalGuildCount = await client.shard.broadcastEval(
            c => c.guilds.cache.size
        ).then(results => results.reduce((acc, count) => acc + count, 0));

        console.log(`[INFO] Shard ${shardId} is ready. Guilds: ${totalGuildCount}`);
        console.log(`[DEBUG] Shard initialization completed in ${Date.now() - startTime}ms.`);
    } catch (err) {
        console.error(`[ERROR] Failed during shard initialization: ${err.message}`);
        process.exit(1);
    }
});

client.on('interactionCreate', async (interaction) => {
    console.log(`[DEBUG] Interaction received: ${interaction.commandName}`);

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
    configureMode();
    modeConfig.logger.info(`Bot starting in ${modeConfig.mode} mode...`);

    registerEventHandlers(client);

    info('Bot initialized successfully.');

    client.login(process.env.BOTTOKEN);
} catch (err) {
    error(`Error during bot initialization: ${err.message}`);
    process.exit(1);
}