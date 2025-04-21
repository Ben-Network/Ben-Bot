import 'dotenv/config';
import { REST, Routes, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientId = process.env.BOTID;
const token = process.env.BOTTOKEN;

if (!token) {
    console.error(chalk.red('[ERROR] Discord bot token is not set. Check your .env file.'));
    process.exit(1);
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.existsSync(eventsPath) ? fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js')) : [];

const groupedCommands = { admin: [], user: [], activation: [], uncategorized: [] };
const commandsCollection = new Collection();

async function loadCommands() {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = await import(filePath);

        if (command.data && command.execute) {
            const commandType = command.type || 'uncategorized';
            groupedCommands[commandType]?.push(command);
            commandsCollection.set(command.data.name, command);

            if (!command.type) {
                console.warn(chalk.yellow(`[WARNING] "${file}" is missing a "type" property. Categorized as "uncategorized".`));
            }
        } else {
            console.error(chalk.red(`[ERROR] "${file}" is missing required "data" or "execute" properties.`));
        }
    }
}

(async () => {
    await loadCommands();

    console.log(chalk.blue.bold('=== Commands Loaded ==='));
    Object.entries(groupedCommands).forEach(([type, commands]) => {
        console.log(chalk.green.bold(`\n[${type.toUpperCase()} COMMANDS]`));
        commands.forEach((command) => console.log(chalk.cyan(`- ${command.data.name}`)));
    });
})();

export async function registerEventHandlers(client) {
    console.log(chalk.blue.bold('=== Event Handlers Loaded ==='));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = await import(filePath);

        if (event.name && event.execute) {
            const handler = (...args) => event.execute(...args);
            if (event.once) {
                client.once(event.name, handler);
            } else {
                client.on(event.name, handler);
            }
            console.log(chalk.green(`[EVENT LOADED] ${event.name}`));
        } else {
            console.error(chalk.red(`[ERROR] "${file}" is missing required "name" or "execute" properties.`));
        }
    }
}

(async () => {
    try {
        const rest = new REST().setToken(token);

        console.log(chalk.yellow('Clearing existing commands...'));
        await rest.put(Routes.applicationCommands(clientId), { body: [] });
        console.log(chalk.green('Existing commands cleared.'));

        const allCommands = Object.values(groupedCommands).flat().map((command) => command.data.toJSON());
        console.log(chalk.blue(`Deploying ${allCommands.length} global application (/) commands.`));

        const data = await rest.put(Routes.applicationCommands(clientId), { body: allCommands });
        console.log(chalk.green(`Successfully deployed ${data.length} commands.`));
    } catch (err) {
        console.error(chalk.red('[ERROR] Failed to deploy commands:'), err);
    }
})();

export { commandsCollection };