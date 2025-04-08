const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { info, warn, error } = require('../resources/scripts/logger');

const ignoreFilePath = path.join(__dirname, '../resources/data/ignored-users.json');

module.exports = {
    type: 'user',
    data: new SlashCommandBuilder()
        .setName('message-readability')
        .setDescription('Manage whether the bot can read your messages.')
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
                const response = isIgnored
                    ? `You're invisible to Ben, he won't read your messages.`
                    : 'The bot can see your messages. He likes you!';
                info(`User ${userId} readability check: ${response}`);
                await interaction.reply({ content: response, ephemeral: true });
            } else if (input === false) {
                // Add user to ignore list
                ignoredUsers[userId] = true;
                saveIgnoredUsers(ignoredUsers);
                info(`User ${userId} added to ignore list.`);
                await interaction.reply({
                    content: "The bot will no longer read your messages.",
                    ephemeral: true
                });
            } else {
                // Remove user from ignore list
                delete ignoredUsers[userId];
                saveIgnoredUsers(ignoredUsers);
                info(`User ${userId} removed from ignore list.`);
                await interaction.reply({
                    content: "bEN can now read your messages again. Hello!",
                    ephemeral: true
                });
            }
        } catch (err) {
            error(`Failed to update or check ignore status for user ${userId}: ${err.message}`);
            await interaction.reply({
                content: 'Something went wrong while managing your message readability status. Try again later.',
                ephemeral: true
            });
        }
    },
};

function loadIgnoredUsers() {
    // Load the ignore list from the file. If it doesn’t exist, create a new one.
    if (!fs.existsSync(ignoreFilePath)) {
        info('Ignore file not found. Creating a new one.');
        return {};
    }
    const data = fs.readFileSync(ignoreFilePath, 'utf8');
    info('Ignore file loaded successfully.');
    return JSON.parse(data);
}

function saveIgnoredUsers(data) {
    // Save the updated ignore list back to the file.
    fs.writeFileSync(ignoreFilePath, JSON.stringify(data, null, 2), 'utf8');
    info('Ignore file updated successfully.');
}
