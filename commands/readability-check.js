const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ignoreFilePath = path.join(__dirname, '../resources/data/ignored-users.json');

module.exports = {
    type: 'user',
    data: new SlashCommandBuilder()
        .setName('readability-check')
        .setDescription('Check if Ben can read your messages.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const ignoredUsers = loadIgnoredUsers();
            const isIgnored = ignoredUsers[userId] === true;

            const response = isIgnored ? 'no.' : 'yes.';
            console.log(`[INFO] User ${userId} readability check: ${response}`);
            await interaction.reply({ content: response, ephemeral: true });
        } catch (error) {
            console.error(`[ERROR] Failed to check ignore status for user ${userId}:`, error.message);
            await interaction.reply({
                content: 'An error occurred while checking your ignore status.',
                ephemeral: true
            });
        }
    },
};

function loadIgnoredUsers() {
    if (!fs.existsSync(ignoreFilePath)) {
        console.log('[INFO] Ignore file not found. Returning empty list.');
        return {};
    }
    const data = fs.readFileSync(ignoreFilePath, 'utf8');
    console.log('[INFO] Ignore file loaded successfully.');
    return JSON.parse(data);
}