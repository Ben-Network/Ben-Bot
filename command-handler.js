require('dotenv').config();
const { REST, Routes, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const chalk = require('chalk'); // Ensure this is compatible with chalk@4

const clientId = process.env.BOTID;
const token = process.env.BOTTOKEN;

if (!token) {
    console.error(chalk.red('[ERROR] Discord bot token (TOKEN) is not set. Please check your .env file.'));
    process.exit(1);
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const groupedCommands = { admin: [], user: [], activation: [], uncategorized: [] };
const commandsCollection = new Collection(); // Store commands in a collection

// Load commands and group them by type
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        if ('type' in command) {
            groupedCommands[command.type]?.push(command);
        } else {
            groupedCommands.uncategorized.push(command);
            console.log(chalk.yellow(`[WARNING] The command file "${file}" is missing a "type" property. Categorized as "uncategorized".`));
        }
        commandsCollection.set(command.data.name, command);
    } else {
        console.log(chalk.red(`[ERROR] The command file "${file}" is missing required "data" or "execute" properties.`));
    }
}

// Display grouped commands
console.log(chalk.blue.bold('=== Loading Commands ==='));
for (const [type, commands] of Object.entries(groupedCommands)) {
    console.log(chalk.green.bold(`\n[${type.toUpperCase()} COMMANDS]`));
    commands.forEach(command => {
        console.log(chalk.cyan(`- ${command.data.name}`));
    });
}

// Deploy commands
(async () => {
    try {
        const rest = new REST().setToken(token);

        // Clear existing commands
        console.log(chalk.yellow('Clearing existing commands...'));
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log(chalk.green('Existing commands cleared.'));

        // Deploy new commands
        const allCommands = [
            ...groupedCommands.admin,
            ...groupedCommands.user,
            ...groupedCommands.activation,
            ...groupedCommands.uncategorized,
        ].map(command => command.data.toJSON());

        console.log(chalk.blue(`\nStarted refreshing ${allCommands.length} global application (/) commands.`));
        const data = await rest.put(Routes.applicationCommands(clientId), { body: allCommands });

        console.log(chalk.green(`Successfully reloaded ${data.length} global application (/) commands.`));
    } catch (error) {
        console.error(chalk.red('[ERROR] Failed to deploy commands:'), error);
    }
})();

module.exports = { commandsCollection }; // Export the collection for use in the bot