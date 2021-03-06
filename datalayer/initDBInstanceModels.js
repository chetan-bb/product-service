'use strict';
const fs = require("fs");
const path = require("path");
const _ = require("underscore");
const Sequelize = require('sequelize');
const modelDir = path.join(__dirname, "../models/schema");

function getDbInstance() {
    let database = config.DATABASE;
    let username = config.USERNAME;
    let password = config.PASSWORD;
    let host = config.HOST;
    let dialect = config.DIALECT;
    let dbPort = config.DBPORT;

    return new Sequelize(database, username, password, {
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
}

function getDBModels(sequelize) {
    let dbModels = {};

    fs.readdirSync(modelDir)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "base.js");
    })
    .forEach(function (file) {
        // console.log(`Checking ${file} file for dbModels`);
        let model = sequelize.import(path.join(modelDir, file));
        dbModels[model.name] = model;
    });

    Object.keys(dbModels).forEach(function (modelName) {
        // console.log("Running FKs linking");
        let associate = getAssociations(dbModels[modelName]);
        // console.log(`Linking FKs for ${modelName}`);
        if (associate && ("associate" in associate) && !dbModels[modelName].synced) {
            // console.log(`Linking FKs for ${modelName}`);
            associate.associate(dbModels, dbModels[modelName]);
            dbModels[modelName].synced = true;
        }
    });

    return dbModels;
}

function getAssociations(model) {
    return model;
}

let dbInstance =  getDbInstance();
module.exports = {
    dbInstance: dbInstance,
    dbModels: getDBModels(dbInstance)
};
