const { info, error } = require('./logger');

(async () => {
    const bodyData = tempVars('output');
    info('Raw bodyData:', bodyData);

    try {
        const parsedData = typeof bodyData === 'string' ? JSON.parse(bodyData) : bodyData;

        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('Invalid JSON data.');
        }

        const wrapLinks = (obj) => {
            if (typeof obj === 'string') {
                return obj.replace(/https?:\/\/[^\s]+/g, (url) => `<${url}>`);
            } else if (typeof obj === 'object' && obj !== null) {
                for (const key in obj) {
                    obj[key] = wrapLinks(obj[key]);
                }
            }
            return obj;
        };

        const processedData = wrapLinks(parsedData);

        const formattedJSON = JSON.stringify(processedData, null, 2);

        Actions.storeValue(formattedJSON, 1, 'formattedmeow', cache);

        info('Formatted JSON with wrapped links:', formattedJSON);
    } catch (err) {
        error('Error parsing or formatting JSON:', err.message);
    }

    Actions.callNextAction(cache);
})();