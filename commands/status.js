import 'dotenv/config';
import DiscordJSpkg from 'discord.js';
import os from 'os';
const { SlashCommandBuilder } = DiscordJSpkg;

export const type = 'user';
export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check the status of the bot.');

export async function execute(interaction) {
    try {
        const promises = [
            interaction.client.shard.fetchClientValues('guilds.cache.size'),
            interaction.client.shard.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
            interaction.client.shard.fetchClientValues('uptime'),
            interaction.client.shard.broadcastEval(function () {
                return {
                    rss: process.memoryUsage().rss,
                    heapUsed: process.memoryUsage().heapUsed,
                    cpuUsage: process.cpuUsage(),
                    shardId: process.env.SHARD_ID || 0,
                    monitoredGuilds: [...this.guilds.cache.keys()],
                };
            }),
        ];

        const results = await Promise.all(promises);

        const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
        const totalMembers = results[1].reduce((acc, memberCount) => acc + memberCount, 0);
        const shardUptimes = results[2].map(uptime => `${(uptime / 1000 / 60).toFixed(2)} minutes`);
        const shardStats = results[3];

        const systemStats = {
            cpuLoad: os.loadavg(),
            totalMemory: os.totalmem(),
            freeMemory: os.freemem(),
            platform: os.platform(),
            uptime: os.uptime(),
        };

        let shardDetails = '';
        shardStats.forEach((shard, index) => {
            shardDetails += `[1;34mShard ${index}:[0m\n`;
            shardDetails += `[1;32m>  RSS Memory: ${(shard.rss / 1024 / 1024).toFixed(2)} MB[0m\n`;
            shardDetails += `[1;33m>  Heap Used: ${(shard.heapUsed / 1024 / 1024).toFixed(2)} MB[0m\n`;
            shardDetails += `[1;36m>  CPU Usage: ${shard.cpuUsage.user / 1000} ms (user), ${shard.cpuUsage.system / 1000} ms (system)[0m\n`;
            shardDetails += `[1;35m>  Monitored Guilds: ${shard.monitoredGuilds.length}[0m\n`;
        });

        const response = `
\`\`\`ansi
[1;4mBot Status[0m
[1;32m> Server Count: ${totalGuilds}[0m
[1;33m> Member Count: ${totalMembers}[0m

[1;4mSystem Stats[0m
[1;36m> CPU Load (1m, 5m, 15m): ${systemStats.cpuLoad.join(', ')}[0m
[1;32m> Total Memory: ${(systemStats.totalMemory / 1024 / 1024).toFixed(2)} MB[0m
[1;33m> Free Memory: ${(systemStats.freeMemory / 1024 / 1024).toFixed(2)} MB[0m
[1;35m> Platform: ${systemStats.platform}[0m
[1;36m> System Uptime: ${(systemStats.uptime / 60 / 60).toFixed(2)} hours[0m

[1;4mShard Stats[0m
[1;34m> Shard Count: ${interaction.client.shard.count}[0m
[1;32m> Shard Uptime: ${shardUptimes.join(', ')}[0m
${shardDetails}
\`\`\`
        `;

        return interaction.reply(response);
    } catch (error) {
        console.error(error);
        return interaction.reply('An error occurred while fetching the bot status.');
    }
}
