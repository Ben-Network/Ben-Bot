const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    type: 'user',
    data: new SlashCommandBuilder()
        .setName('example')
        .setDescription('An example command'),
    async execute(interaction) {
        await interaction.reply('This is an example command!');
    },
};
