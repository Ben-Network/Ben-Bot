require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { operation } = require('../resources/scripts/database-operation');

module.exports = {
    type: 'admin',
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new row.')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The word that\'s used.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('actiontype')
                .setDescription('What kind of action?')
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
                .setDescription('What should it do? Text, URL, etc.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('notes')
                .setDescription('Optional notes.')
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
            const result = await operation('add', keyword, action, interaction.user.id, notes);
            await interaction.reply(`\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
        } catch (err) {
            console.error(`[ERROR] Failed to execute create command: ${err.message}`);
            await interaction.reply({ content: 'An error occurred while creating the activation.', ephemeral: true });
        }
    },
};