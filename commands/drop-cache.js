import 'dotenv/config';
import { SlashCommandBuilder } from 'discord.js';
import { clearCache } from '../resources/scripts/MYSQL_cache/cache-drop.js';

export const type = 'admin';
export const data = new SlashCommandBuilder()
    .setName('dropcache')
    .setDescription('Manually clear and update the cache.');
export async function execute(interaction) {
    if (interaction.user.id !== process.env.OWNERID) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    try {
        const result = await clearCache();
        await interaction.reply(`\`\`\`json\n${result}\n\`\`\``);
    } catch (err) {
        console.error(`[ERROR] Failed to clear cache: ${err.message}`);
        await interaction.reply({ content: 'An error occurred while clearing the cache.', ephemeral: true });
    }
}
