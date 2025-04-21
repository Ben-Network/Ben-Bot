import { ClusterManager } from 'discord.js-cluster';
import dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';

dotenv.config();

// Convert bot.js path to a file:// URL
const botFilePath = pathToFileURL(path.resolve('./bot.js')).toString();

const manager = new ClusterManager(botFilePath, {
    token: process.env.BOTTOKEN,
    totalShards: 'auto',
    shardsPerCluster: 1,
    mode: 'process',
    timeout: 180000,
});

manager.on('clusterCreate', (cluster) => {
    const shardList = cluster.shardList ? cluster.shardList.join(', ') : 'N/A';
    console.log(`[INFO] Launched cluster ${cluster.id} with shards: ${shardList}`);
});

manager.spawn();
