require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { operation } = require('../resources/scripts/database-operation');

module.exports = {
    type: 'admin',
    data: new SlashCommandBuilder()
        .setName('update')
        .setDescription('Update a row')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The word that\'s looked for when modifying the action.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('actiontype')
                .setDescription('What\'s the type of action that will be called?')
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
                .setDescription('URL, Text, or DBM ID.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Any notes for this query?')
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
        } catch (error) {
            console.error('Error executing update command:', error.message);
            await interaction.reply({ content: 'An error occurred while updating the row.', ephemeral: true });
        }
    },
};
