(async () => {
    const bodyData = tempVars('output');
    console.log('Raw bodyData:', bodyData);

    try {
        const parsedData = typeof bodyData === 'string' ? JSON.parse(bodyData) : bodyData;

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

        console.log('Formatted JSON with wrapped links:', formattedJSON);
    } catch (err) {
        console.error('Error parsing or formatting JSON:', err.message);
    }

    Actions.callNextAction(cache);
})();