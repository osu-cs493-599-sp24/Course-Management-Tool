const { Sequelize } = require("sequelize")



const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.MYSQL_HOST || "127.0.0.1",   
    port: process.env.MYSQL_PORT || 3306,
    database: process.env.MYSQL_DB,
    username: process.env.MYSQL_username,
    password: process.env.MYSQL_password,
    
});



sequelize.authenticate()
    .then(() => console.log('Connection has been established successfully.'))
    .catch(err => console.error('Unable to connect to the database:', err));


module.exports = sequelize






  

