const { Sequelize } = require('sequelize');

// Configure Sequelize to connect to your MySQL database
// Change as needed 
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',  // Host where the MySQL server is accessible
  port: 3309,         // Port where the MySQL server is listening, changed to 3309
  database: "businesses",  // Name of the database
  username: "businesses",  // Username for the database
  password: "hunter2"      // Password for the database user
});

// Test the database connection
sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(err => console.error('Unable to connect to the database:', err));

// Export the configured Sequelize instance
module.exports = sequelize;