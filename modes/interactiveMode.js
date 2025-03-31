const readline = require('readline');
const processActivations = require('../resources/scripts/process-activations'); // Import activation logic

module.exports = (client, modeConfig) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    modeConfig.logger.info('Interactive Terminal Mode initialized. Type commands below:');
    console.log('Use the format:');
    console.log('  Slash commands: /commandName option1=value1 option2=value2');
    console.log('  Normal messages: Just type your message directly.');

    rl.on('line', async (input) => {
        try {
            if (input.startsWith('/')) {
                // Handle slash commands
                const [commandName, ...args] = input.slice(1).split(' ');
                const options = args.reduce((acc, arg) => {
                    const [key, value] = arg.split('=');
                    if (key && value) acc[key] = value;
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
                        modeConfig.logger.info(`Bot response: ${message}`);
                        console.log(`Bot: ${message}`);
                    }
                };

                // Execute the command
                const command = client.commands.get(commandName);
                if (command) {
                    await command.execute(interaction);
                } else {
                    console.log(`Unknown command: ${commandName}`);
                }
            } else {
                // Handle normal messages
                const inputMessage = input.trim();
                const currentTime = Date.now();

                // Simulate a user message object
                const message = {
                    content: inputMessage,
                    author: { id: process.env.OWNERID }, // Simulate the bot owner as the user
                    reply: async (response) => {
                        modeConfig.logger.info(`Bot response: ${response}`);
                        console.log(`Bot: ${response}`);
                    }
                };

                // Process activations (similar to activation-handler.js)
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
            modeConfig.logger.error('Error processing input:', err);
        }
    });
};