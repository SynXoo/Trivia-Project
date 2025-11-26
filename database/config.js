const { Sequelize } = require('sequelize');
const path = require('path');

/**
 * Creating a sequelize instance
 * It bridges conenction between Node.js and the database
 */
const sequelize = new Sequelize({
    dialect: 'sqlite', // Using SQLite for simplicity, will later change to something like PostgreSQL
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: console.log, // Should turn off in production

    // Manage database connections
    pool: {
        max: 5,
        min: 0,
        acquire: 30000, // Time in ms to acquire a connection from the pool
        idle: 10000
    }
});

/**
 * Tests the connection to the database
 * It will be called on server start
 */

async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return false;
    }
}

/**
 * Initializes the database and creates the tables
 * It will be called on server start
 */
async function initializeDatabase() {
    try {
        await testConnection();
        await sequelize.sync(); // Can be forced to reset the database by passing { force: true }
        console.log('Database and tables created!');
        return true;
    } catch (error) {
        console.error('Unable to create database and tables:', error);
        return false;
    }
}

module.exports = {
    sequelize,
    initializeDatabase, 
    testConnection
}