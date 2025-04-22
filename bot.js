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

        const shardId = client.shard?.ids?.[0] ?? 'N/A'; // Ensure shardId is safely accessed

        // Ensure all shards are ready before calculating total guild count
        if (client.shard) {
            await client.shard.broadcastEval(client => client && client.readyAt !== null);

            const totalGuildCount = await client.shard.broadcastEval(
                client => client ? client.guilds.cache.size : 0
            ).then(results => results.reduce((acc, count) => acc + count, 0));

            console.log(`[INFO] Shard ${shardId} is ready. Guilds: ${totalGuildCount}`);
        } else {
            console.warn('[WARN] Shard manager is not available. Skipping guild count calculation.');
        }

        console.log(`[DEBUG] Shard initialization completed in ${Date.now() - startTime}ms.`);
    } catch (err) {
        console.error(`[ERROR] Failed during shard initialization: ${err.message}`);
        process.exit(1);
    }
});

client.on('interactionCreate', async (interaction) => {
    console.log(`[DEBUG] Interaction received: ${interaction.commandName}`);

    if (!interaction.isCommand()) return;

    const comand = commandsCollection.get(interaction.commandName);

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
