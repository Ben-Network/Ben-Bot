require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { operation } = require('../resources/scripts/database-operation');
const chalk = require('chalk');

module.exports = {
    type: 'user',
    data: new SlashCommandBuilder()
        .setName('read')
        .setDescription('Read data from the cache or database')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('What type of read operation will be done?')
                .setRequired(true)
                .addChoices(
                    { name: 'schema', value: 'schema' },
                    { name: 'keyword', value: 'keyword' },
                    { name: 'author', value: 'authorID' }
                ))
        .addStringOption(option =>
            option.setName('source')
                .setDescription('Where will we search?')
                .setRequired(true)
                .addChoices(
                    { name: 'cache', value: 'cache' },
                    { name: 'mysql', value: 'mysql' }
                ))
        .addStringOption(option =>
            option.setName('input')
                .setDescription('What will we be searching for?')
                .setRequired(false)),
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNERID) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const type = interaction.options.getString('type');
        const source = interaction.options.getString('source');
        const input = interaction.options.getString('input') || null;

        try {
            const result = await operation('read', input, null, null, null, type, source);
            await interaction.reply(`\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
        } catch (error) {
            console.error(chalk.red.bold('[ERROR]'), chalk.yellow('Error executing read command:'), chalk.cyan(error.message));
            await interaction.reply({ content: `An error occurred while reading data: ${error.message}`, ephemeral: true });
        }
    },
};
