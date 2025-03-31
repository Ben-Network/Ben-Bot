require('dotenv').config();
const { SlashCommandBuilder } = require('discord.js');
const { operation } = require('../resources/scripts/database-operation');

module.exports = {
    type: 'admin',
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a row')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('The word that\'s looked for in messages')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.user.id !== process.env.OWNERID) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        const keyword = interaction.options.getString('keyword');

        try {
            const result = await operation('remove', keyword);
            await interaction.reply(`\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
        } catch (error) {
            console.error('Error executing delete command:', error.message);
            await interaction.reply({ content: 'An error occurred while deleting the row.', ephemeral: true });
        }
    },
};
