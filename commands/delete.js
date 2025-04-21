import 'dotenv/config';
import { SlashCommandBuilder } from 'discord.js';
import { operation } from '../resources/scripts/database-operation.js';

export const type = 'admin';
export const data = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete a row.')
    .addStringOption(option => option.setName('keyword')
        .setDescription('The keyword to delete.')
        .setRequired(true));
export async function execute(interaction) {
    if (interaction.user.id !== process.env.OWNERID) {
        return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
    }

    const keyword = interaction.options.getString('keyword');

    try {
        const result = await operation('remove', keyword);
        await interaction.reply(`\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
    } catch (err) {
        console.error(`[ERROR] Failed to execute delete command: ${err.message}`);
        await interaction.reply({ content: 'An error occurred while deleting the activation.', ephemeral: true });
    }
}
