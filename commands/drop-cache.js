require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { clearCache } = require('../resources/scripts/MYSQL_cache/cache-drop');

module.exports = {
    type: 'admin',
    data: new SlashCommandBuilder()
        .setName('drop-cache')
        .setDescription('Manually purge and update the cache'),
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNERID) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        try {
            const result = await clearCache();
            console.log('[INFO] Cache cleared and updated successfully.');
            await interaction.reply(`\`\`\`json\n${result}\n\`\`\``);
        } catch (error) {
            console.error(`[ERROR] Failed to clear cache: ${error.message}`);
            await interaction.reply({ content: 'An error occurred while clearing the cache.', ephemeral: true });
        }
    },
};
