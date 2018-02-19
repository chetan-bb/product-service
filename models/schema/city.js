/**
 * Created by anuranjit on 6/6/16.
 */

"use strict";

const base = require('./base.js');

module.exports = function (sequelize, DataTypes) {
    return sequelize.define("City",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "name": {type: DataTypes.STRING(50), allowNull: false},
            "slug": {type: DataTypes.STRING(50), allowNull: false},
            "prefix": {type: DataTypes.STRING(2), allowNull: false, unique: true},
            "active": {type: DataTypes.BOOLEAN, defaultValue: true},
            "warehouseFulfilment": {type: DataTypes.BOOLEAN, defaultValue: false, field: "warehouse_fulfilment"}
        }, DataTypes),
        // Configs, 
        new base.DefaultModelConfig("bb_city"));
};