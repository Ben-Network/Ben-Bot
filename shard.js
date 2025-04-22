import { ShardingManager } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const managerialStaff = new ShardingManager("bot.js", {
    token: process.env.BOTTOKEN,
    totalShards: "auto",
    shardList: "auto",
    mode: 'process',
    respawn: true,
});

managerialStaff.spawn().then(() => {
    console.log(`[INFO] All shards [${managerialStaff.totalShards}] launched successfully.`);
}).catch((error) => {
    console.error('[ERROR] Failed to launch shards:', error);
});
