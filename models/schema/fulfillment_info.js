"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const FulfillmentInfo = sequelize.define("FulfillmentInfo",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            // "name": {type: DataTypes.STRING(50), allowNull: false},
            // "fulfilledBy": {type: DataTypes.STRING(50), defaultValue: "Bigbasket", field: "fulfilled_by"},
            "fulfillmentType": {type: DataTypes.STRING(30), defaultValue: "normal", field: "fulfillment_type"}
            // "displayName": {type: DataTypes.STRING(255), allowNull: false, field: "display_name"}

        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("fulfillment_fulfillmentinfo"));

    FulfillmentInfo.associate = function (dbModels, value) {
        value.belongsTo(dbModels.City, {
            foreignKey: {
                allowNull: false
            }
        });
    };
    return FulfillmentInfo;
};