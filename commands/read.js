import 'dotenv/config';
import { SlashCommandBuilder } from 'discord.js';
import { operation } from '../resources/scripts/database-operation.js';
import { info, error } from '../resources/scripts/logger.js';

export const type = 'admin';
export const data = new SlashCommandBuilder()
    .setName('read')
    .setDescription('Read data from the cache or database.')
    .addStringOption(option => option.setName('type')
        .setDescription('The type of data to read.')
        .setRequired(true)
        .addChoices(
            { name: 'schema', value: 'schema' },
            { name: 'keyword', value: 'keyword' },
            { name: 'author', value: 'authorID' }
        ))
    .addStringOption(option => option.setName('source')
        .setDescription('The source to read from.')
        .setRequired(true)
        .addChoices(
            { name: 'cache', value: 'cache' },
            { name: 'mysql', value: 'mysql' }
        ))
    .addStringOption(option => option.setName('input')
        .setDescription('The input to search for.')
        .setRequired(false));
export async function execute(interaction) {
    console.log(`[DEBUG] /read command executed by user: ${interaction.user.id}`);

    if (interaction.user.id !== process.env.OWNERID) {
        return interaction.reply({
            content: 'You do not have permission to use this command.',
            ephemeral: true,
        });
    }

    const type = interaction.options.getString('type');
    const source = interaction.options.getString('source');
    const input = interaction.options.getString('input') || null;

    try {
        // Defer the reply to avoid interaction timeout
        await interaction.deferReply({ ephemeral: true });

        info(`[READ COMMAND] Type: ${type}, Source: ${source}, Input: ${input}`);
        const result = await operation({ opType: 'read', input, readType: type, source });

        if (!result) {
            return interaction.editReply({
                content: 'No data found for the given parameters.',
            });
        }

        await interaction.editReply(`\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``);
    } catch (err) {
        error(`[ERROR] Failed to execute read command: ${err.message}`);
        await interaction.editReply({
            content: `An error occurred while reading data: ${err.message}`,
        });
    }
}
