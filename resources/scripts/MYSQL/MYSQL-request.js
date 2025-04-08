const mysql = require('mysql2/promise');

module.exports = async function searchKeyword(keyword) {
    const connectionConfig = {
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
    };
    const table = process.env.TABLE;

    try {
        const connection = await mysql.createConnection(connectionConfig);
        const [results] = await connection.query(`SELECT action FROM ${table} WHERE word = ?`, [keyword]);
        await connection.end();

        if (results.length > 0) {
            console.log(`[INFO] Action found for keyword: ${keyword}`);
            return JSON.parse(results[0].action);
        } else {
            console.log(`[INFO] No action found for keyword: ${keyword}`);
            return null;
        }
    } catch (err) {
        console.error(`[ERROR] Database query failed: ${err.message}`);
        return null;
    }
};