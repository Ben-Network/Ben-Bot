// Use require instead of import for DBM
const mysql = require('mysql2');

var input = slashParams("input"); 
var output = [];

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: '35.239.49.108',      // Replace with your MySQL server host (e.g., '127.0.0.1')
  user: 'ben',           // Replace with your MySQL username
  password: 'ProjectLinus117!', // Replace with your MySQL password
  database: 'BenDB'         // Replace with the name of your database
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    // If there's an error connecting to the database, log the error and stop execution
    output.push(`{"response": "500", "message": "Failed to connect to the database"}`);
    return;
  }
  // If the connection is successful, log the connection thread ID
});

// Function to search for a keyword and return the corresponding action
function searchKeyword(keyword) {
  // Define the SQL query to search for the `action` based on the `keyword`
  // The `?` is a placeholder to prevent SQL injection
  const query = 'SELECT action FROM keywords WHERE word = ?';

  // Execute the query using the connection object
  // The second argument is an array of values to replace the `?` placeholders
  connection.query(query, [keyword], (err, results) => {
    if (err) {
      // If there's an error executing the query, log the error and stop execution
      output.push('Error executing query:', err.stack);
      return;
    }

    // Check if any results were returned
    if (results.length > 0) {
      // If results are found, log the `action` for the given `keyword`
    output.push(`{"status": "404", ${results[0].action}}`);
    } else {
      // If no results are found, log a message indicating that no action was found
      output.push(`{"status": "404", "content": "No action found for ${keyword}"}`);
    }
    
    // Close the database connection when done
    connection.end();
    
    // Store the output after the query completes
    Actions.storeValue(output.join("\n"), 1, "result", cache);
    Actions.callNextAction(cache);
  });
}

searchKeyword(input);