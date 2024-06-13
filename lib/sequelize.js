const { Sequelize } = require('sequelize');
const wait = require('util').promisify(setTimeout);

// Configure Sequelize to connect to your MySQL database using environment variables
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',   // Host where the MySQL server is accessible
  port: process.env.DB_PORT || 3306,          // Port where the MySQL server is listening
  database: process.env.DB_NAME || "finalproject",  // Name of the database
  username: process.env.DB_USER || "finalproject",  // Username for the database
  password: process.env.DB_PASSWORD || "hunter2"    // Password for the database user
});

// Test the database connection with retry logic
async function connectWithRetry() {
  let retries = 5;
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
      break;
    } catch (err) {
      console.error('Unable to connect to the database:', err);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      await wait(5000); // wait for 5 seconds before retrying
    }
  }
}

connectWithRetry();

// Export the configured Sequelize instance
module.exports = sequelize;
