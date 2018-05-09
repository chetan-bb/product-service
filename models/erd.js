const Sequelize = require('sequelize');
const { writeFileSync } = require('fs');
const path = require('path');
const sequelizeErd = require("sequelize-erd");

let database = process.env.DATABASE || 'bigbasket';
let username = process.env.USERNAME || 'root';
let password = process.env.PASSWORD || 'toor';
let host = process.env.HOST || 'localhost';
let dialect = process.env.DIALECT || 'mysql';
let dbPort = process.env.DBPORT || 3306;

// console.log(database, username, password, host);
const sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: dialect,
    port: dbPort,
    pool: {
        max: 5,
        min: 1,
        acquire: 30000,
        idle: 10000
    }
});


//module.exports = sequelize;

sequelize.authenticate()
    .then(() => {
        logger.debug('Connection has been established successfully.');
        generateERD(sequelize);
    })
    .catch(err => {
        logger.exception('Unable to connect to the database:', err);
    });

function generateERD(sequelize) {
    // console.log(path.join(__dirname, 'schema/product.js'));
    const svg = sequelizeErd(path.join(__dirname, 'schema/product.js'));
    writeFileSync(path.join(__dirname, 'erd.svg'), svg);
    setTimeout(() => process.exit(0), 800);
    // console.log('SVG generated successfully');
}