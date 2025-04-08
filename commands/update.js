require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { operation } = require('../resources/scripts/database-operation');

module.exports = {
    type: 'admin',
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update a row.')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The keyword to update.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('actiontype')
                .setDescription('The new action type.')
                .setRequired(true)
                .addChoices(
                    { name: 'text', value: 'txt' },
                    { name: 'localfile', value: 'Lfile' },
                    { name: 'webfile', value: 'Wfile' },
                    { name: 'dbmcommand', value: 'DBMcommand' },
                    { name: 'dbmevent', value: 'DBMevent' },
                ))
        .addStringOption(option =>
            option.setName('actioncontent')
                .setDescription('The new action content.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Optional notes for this activation.')
                .setRequired(false)),
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNERID) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const keyword = interaction.options.getString('keyword');
        const actionType = interaction.options.getString('actiontype');
        const actionContent = interaction.options.getString('actioncontent');
        const notes = interaction.options.getString('notes') || 'No notes provided';

        try {
            const action = { type: actionType, content: actionContent };
            const result = await operation('modify', keyword, action, null, notes);
            await interaction.reply(`\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
        } catch (err) {
            console.error(`[ERROR] Failed to execute update command: ${err.message}`);
            await interaction.reply({ content: 'An error occurred while updating the activation.', ephemeral: true });
        }
    },
};
