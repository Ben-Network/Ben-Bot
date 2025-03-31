const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    type: 'user',
    data: new SlashCommandBuilder()
        .setName('see-my-messages')
        .setDescription('Do you want Ben to see your messages?')
        .addBooleanOption(option =>
            option.setName('input')
                .setDescription('True for yes, False for no.')
                .setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getBoolean('input');

        if (input === false) {
            // Set the `ben.isIgnored` flag for the user
            await setMemberData(interaction.user.id, 'ben.isIgnored', 'true');
            await interaction.reply({
                content: "Set `ben.isIgnored` to `True`! Ben is no longer able to see your messages.",
                ephemeral: true
            });
        } else {
            // Remove the `ben.isIgnored` flag for the user
            await deleteMemberData(interaction.user.id, 'ben.isIgnored');
            await interaction.reply({
                content: "Set `ben.isIgnored` to `False`! Ben is now able to read and reply to your messages.",
                ephemeral: true
            });
        }
    },
};

// Helper function to set member data
async function setMemberData(userId, dataName, value) {
    // Implement your data storage logic here (e.g., database, JSON file, etc.)
    console.log(`[SUCCESS] Setting ${dataName} to ${value} for user ${userId}`);
}

// Helper function to delete member data
async function deleteMemberData(userId, dataName) {
    // Implement your data deletion logic here (e.g., database, JSON file, etc.)
    console.log(`[SUCCESS] Deleting ${dataName} for user ${userId}`);
}