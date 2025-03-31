const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const ignoreFilePath = path.join(__dirname, '../resources/data/ignored-users.json');

module.exports = {
    type: 'user',
    data: new SlashCommandBuilder()
        .setName('message-readability')
        .setDescription('Manage whether Ben can read your messages.')
        .addBooleanOption(option =>
            option.setName('input')
                .setDescription('True to allow, False to ignore. Leave empty to check your current status.')
                .setRequired(false)),
    async execute(interaction) {
        const input = interaction.options.getBoolean('input');
        const userId = interaction.user.id;

        try {
            const ignoredUsers = loadIgnoredUsers();

            if (input === null) {
                // Check current status
                const isIgnored = ignoredUsers[userId] === true;
                const response = isIgnored ? 'Ben cannot see your messages.' : 'Ben can see your messages.';
                console.log(`[INFO] User ${userId} readability check: ${response}`);
                await interaction.reply({ content: response, ephemeral: true });
            } else if (input === false) {
                // Add user to ignore list
                ignoredUsers[userId] = true;
                saveIgnoredUsers(ignoredUsers);
                console.log(`[INFO] User ${userId} added to ignore list.`);
                await interaction.reply({
                    content: "Ben will no longer see your messages.",
                    ephemeral: true
                });
            } else {
                // Remove user from ignore list
                delete ignoredUsers[userId];
                saveIgnoredUsers(ignoredUsers);
                console.log(`[INFO] User ${userId} removed from ignore list.`);
                await interaction.reply({
                    content: "Ben will now see your messages.",
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error(`[ERROR] Failed to update or check ignore status for user ${userId}:`, error.message);
            await interaction.reply({
                content: 'An error occurred while managing your message readability status.',
                ephemeral: true
            });
        }
    },
};

function loadIgnoredUsers() {
    if (!fs.existsSync(ignoreFilePath)) {
        console.log('[INFO] Ignore file not found. Creating a new one.');
        return {};
    }
    const data = fs.readFileSync(ignoreFilePath, 'utf8');
    console.log('[INFO] Ignore file loaded successfully.');
    return JSON.parse(data);
}

function saveIgnoredUsers(data) {
    fs.writeFileSync(ignoreFilePath, JSON.stringify(data, null, 2), 'utf8');
    console.log('[INFO] Ignore file updated successfully.');
}
