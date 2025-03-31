const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const processActivations = require('../resources/scripts/process-activations');

const ignoreFilePath = path.join(__dirname, '../resources/data/ignored-users.json');

// Global variables that were previously handled by DBM
let globalVariables = {
    lastMSGRunTime: 0,
    GlobalCooldownTime: 5000 // Default 5 seconds, adjust as needed
};

module.exports = {
    type: 'activation',
    data: new SlashCommandBuilder()
        .setName('activation-handler')
        .setDescription('Processes various types of activations')
        .addStringOption(option =>
            option.setName('input')
                .setDescription('Input for the activation handler')
                .setRequired(true)),
    async execute(interaction) {
        const input = interaction.options.getString('input');
        const currentTime = Date.now();

        // Check cooldown
        if (currentTime - globalVariables.lastMSGRunTime < globalVariables.GlobalCooldownTime) {
            await interaction.reply({ content: 'Command is on cooldown. Please wait.', ephemeral: true });
            return;
        }

        // Check if user is ignored
        const isIgnored = getMemberData(interaction.user.id);
        if (isIgnored) {
            await interaction.reply({ content: 'You are ignored and cannot use this command.', ephemeral: true });
            return;
        }

        // Process activations
        const result = await processActivations(input);
        if (!result) {
            await interaction.reply({ content: 'No activation found for the input.', ephemeral: true });
            return;
        }

        // Handle result
        globalVariables.lastMSGRunTime = currentTime;
        const { type, content } = result;

        switch (type) {
            case 'txt':
                await interaction.reply({ content });
                break;
            case 'Lfile':
                await interaction.reply({ files: [content] });
                break;
            case 'Wfile':
                await interaction.reply({ content });
                break;
            default:
                await interaction.reply({ content: 'Unknown activation type.', ephemeral: true });
        }
    },
};

function getMemberData(userId) {
    if (!fs.existsSync(ignoreFilePath)) return false;
    const ignoredUsers = JSON.parse(fs.readFileSync(ignoreFilePath, 'utf8'));
    return ignoredUsers[userId] === true;
}