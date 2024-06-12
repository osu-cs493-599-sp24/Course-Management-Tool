const { Sequelize } = require('sequelize');

// Configure Sequelize to connect to your MySQL database
// Change as needed 
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'localhost',  // Host where the MySQL server is accessible
  port: 3306,         // Port where the MySQL server is listening, changed to 3309
  database: "finalproject",  // Name of the database
  username: "finalproject",  // Username for the database
  password: "hunter2"      // Password for the database user
});

// Test the database connection
sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(err => console.error('Unable to connect to the database:', err));

// Export the configured Sequelize instance
module.exports = sequelize;


// docker set up code

/*
docker run -d --name mysql-server               \
        --network mysql-net                                     \
        -p "3306:3306"                                          \
        -e "MYSQL_RANDOM_ROOT_PASSWORD=yes"     \
        -e "MYSQL_DATABASE=finalproject"                \
        -e "MYSQL_USER=finalproject"                    \
        -e "MYSQL_PASSWORD=hunter2"                     \
mysql
*/