require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { operation } = require('../resources/scripts/database-operation');
const { lookupInCache } = require('../resources/scripts/MYSQL_cache/cache-lookup');
const { info, error } = require('../resources/scripts/logger');

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
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                flags: 64,
            });
        }

        const keyword = interaction.options.getString('keyword');
        const actionType = interaction.options.getString('actiontype');
        const actionContent = interaction.options.getString('actioncontent');
        const notes = interaction.options.getString('notes') || 'No notes provided';

        try {
            const existingEntry = lookupInCache(keyword);
            if (existingEntry) {
                return interaction.reply({
                    content: `The keyword "${keyword}" already exists. Please use a different keyword.`,
                    flags: 64,
                });
            }

            const action = { type: actionType, content: actionContent };
            info(`[CREATE COMMAND] Keyword: ${keyword}, Action: ${JSON.stringify(action)}, Notes: ${notes}`);
            const result = await operation({ opType: 'add', input: keyword, action, authorID: interaction.user.id, notes });
            await interaction.reply(`\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
        } catch (err) {
            error(`[ERROR] Failed to execute create command: ${err.message}`);
            await interaction.reply({
                content: `An error occurred while creating the activation: ${err.message}`,
                flags: 64,
            });
        }
    },
};