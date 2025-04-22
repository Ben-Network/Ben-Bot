import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import processActivations from '../resources/scripts/process-activations.js';
import { info, warn, error } from '../resources/scripts/logger.js';

// add these cus I don't feel like changing everything to use path.join
const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const ignoreFilePath = join(__dirname, '../resources/data/ignored-users.json');

// Cooldown stuff, nuggets kept spamming it and lagged out my whole damn computer.
let globalVariables = {
    lastMSGRunTime: 0,
    GlobalCooldownTime: process.env.MESSAGE_COOLDOWN || 5000, // should I make this configurable in env? | Yes.
};

export const name = 'messageCreate';
export async function execute(message) {
    info(`messageCreate event triggered by user: ${message.author.id}`);

    if (isBotMessage(message)) return;
    if (isUserIgnored(message.author.id)) return;
    if (isOnCooldown()) return;

    const result = await processMessage(message);
    if (isInvalidResult(result)) return;

    globalVariables.lastMSGRunTime = Date.now();

    try {
        await sendActivationResponse(message, result.action.type, result.action.content);
    } catch (err) {
        error(`Failed to send activation response: ${err.message}`);
    }
}

export function isBotMessage(message) {
    if (message.author.bot) {
        info(`This... This is a bot's message. We don't reply to these.`);
        return true;
    }
    return false;
}

export function isUserIgnored(userId) {
    const ignoredUsers = loadIgnoredUsers();
    if (ignoredUsers[userId]) {
        info(`User ${userId} is opted out so we gon stop this right here :>.`);
        return true;
    }
    return false;
}

export function isOnCooldown() {
    const currentTime = Date.now();
    if (currentTime - globalVariables.lastMSGRunTime < globalVariables.GlobalCooldownTime) {
        info('CHILL YOUR BALLSACK');
        return true;
    }
    return false;
}

export function isInvalidResult(result) {
    if (isResultInvalid(result)) {
        warn('No keyword match found. Better luck next time.');
        return true;
    }
    return false;
}

function isResultInvalid(result) {
    return !result || !result.action?.type || !result.action?.content;
}

export async function processMessage(message) {
    return await processActivations(message.content);
}

export async function sendActivationResponse(message, type, content) {
    switch (type) {
        case 'txt':
            await message.channel.send(content);
            break;
        case 'Lfile':
            await message.channel.send({ files: [content] });
            break;
        case 'Wfile':
            await message.channel.send(content);
            break;
        default:
            throw new Error(`Unknown activation type: ${type}. Who wrote this?`);
    }
}

export function loadIgnoredUsers() {
    if (!existsSync(ignoreFilePath)) {
        info('Ignore file not found. Creating a new one.');
        return {};
    }
    const data = readFileSync(ignoreFilePath, 'utf8');
    info('Ignore file loaded successfully.');
    return JSON.parse(data);
}