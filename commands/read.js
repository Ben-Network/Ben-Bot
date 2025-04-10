require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { operation } = require('../resources/scripts/database-operation');
const { info, error } = require('../resources/scripts/logger');

module.exports = {
    type: 'admin',
    data: new SlashCommandBuilder()
        .setName('read')
        .setDescription('Read data from the cache or database.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of data to read.')
                .setRequired(true)
                .addChoices(
                    { name: 'schema', value: 'schema' },
                    { name: 'keyword', value: 'keyword' },
                    { name: 'author', value: 'authorID' }
                ))
        .addStringOption(option =>
            option.setName('source')
                .setDescription('The source to read from.')
                .setRequired(true)
                .addChoices(
                    { name: 'cache', value: 'cache' },
                    { name: 'mysql', value: 'mysql' }
                ))
        .addStringOption(option =>
            option.setName('input')
                .setDescription('The input to search for.')
                .setRequired(false)),
    async execute(interaction) {
        console.log(`[DEBUG] /read command executed by user: ${interaction.user.id}`); // Debug log

        if (interaction.user.id !== process.env.OWNERID) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                flags: 64, // Replaces "ephemeral"
            });
        }

        const type = interaction.options.getString('type');
        const source = interaction.options.getString('source');
        const input = interaction.options.getString('input') || null;

        try {
            info(`[READ COMMAND] Type: ${type}, Source: ${source}, Input: ${input}`);
            const result = await operation({ opType: 'read', input, readType: type, source }); // Pass 'read' as opType

            if (!result) {
                return interaction.reply({
                    content: 'No data found for the given parameters.',
                    flags: 64, // Replaces "ephemeral"
                });
            }

            await interaction.reply(`\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
        } catch (err) {
            error(`[ERROR] Failed to execute read command: ${err.message}`);
            await interaction.reply({
                content: `An error occurred while reading data: ${err.message}`,
                flags: 64, // Replaces "ephemeral"
            });
        }
    },
};
