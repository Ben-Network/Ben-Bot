const readline = require('readline');

module.exports = (client, modeConfig) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    modeConfig.logger.info('Interactive Terminal Mode initialized. Type commands below:');

    rl.on('line', async (input) => {
        try {
            const [commandName, ...args] = input.split(' ');
            const options = args.reduce((acc, arg) => {
                const [key, value] = arg.split('=');
                acc[key] = value;
                return acc;
            }, {});

            // Simulate a Discord interaction
            const interaction = {
                commandName,
                options,
                reply: (message) => {
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
        } catch (err) {
            modeConfig.logger.error('Error executing command:', err);
        }
    });
};