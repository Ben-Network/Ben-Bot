const readline = require('readline');
const processActivations = require('../resources/scripts/process-activations');
const { info, error } = require('../resources/scripts/logger');

module.exports = (client, modeConfig) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    info('Interactive Terminal Mode initialized. Type commands below:');
    info('Use the format:');
    info('  Slash commands: /commandName option1=value1 option2=value2');
    info('  Normal messages: Just type your message directly.');

    rl.on('line', async (input) => {
        try {
            if (input.startsWith('/')) {
                // Handle slash commands
                const [commandName, ...args] = input.slice(1).split(' ');
                const options = args.reduce((acc, arg) => {
                    const [key, value] = arg.split('=');
                    if (key && value !== undefined) acc[key] = value;
                    return acc;
                }, {});

                // Simulate a Discord interaction object
                const interaction = {
                    commandName,
                    options: {
                        getString: (name) => options[name] || null,
                        getBoolean: (name) => options[name] === 'true',
                        getInteger: (name) => parseInt(options[name], 10) || null,
                    },
                    user: { id: process.env.OWNERID }, // Simulate the bot owner as the user
                    reply: async (message) => {
                        info(`Bot response: ${message}`);
                    }
                };

                // Execute the command
                const command = client.commands.get(commandName);
                if (command) {
                    await command.execute(interaction);
                } else {
                    info(`Unknown command: ${commandName}`);
                }
            } else {
                // Handle normal messages
                const inputMessage = input.trim();

                // Simulate a user message object
                const message = {
                    content: inputMessage,
                    author: { id: process.env.OWNERID }, // Simulate the bot owner as the user
                    reply: async (response) => {
                        info(`Bot response: ${response}`);
                    }
                };

                // Process activations
                const result = await processActivations(inputMessage);
                if (!result) {
                    return;
                }

                const { type, content } = result;
                switch (type) {
                    case 'txt':
                        await message.reply(content);
                        break;
                    case 'Lfile':
                        await message.reply(`File sent: ${content}`);
                        break;
                    case 'Wfile':
                        await message.reply(content);
                        break;
                    default:
                        await message.reply('Unknown activation type.');
                }
            }
        } catch (err) {
            error('Error processing input:', err);
        }
    });
};