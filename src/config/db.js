const Sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.config(); 

let password = process.env.DB_PASSWORD || ""; 

// Ensure that password is a string (this step may not be necessary if password is already a string)
password = password.toString();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  password,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false, 
  }
);

// Test the connection (optional but good practice)
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

module.exports = sequelize;
