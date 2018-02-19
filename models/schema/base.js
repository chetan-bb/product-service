"use strict";

const underscore = require("underscore")._;

class DefaultModelConfig {
    constructor(tableName) {
        /*
        timestamps: add the timestamp attributes (updatedAt, createdAt)
        underscored: camelcase for automatically added attributes but underscore style
        freezeTableName: By default, sequelize will automatically
                         transform all passed model names (first parameter of define) into plural
         */
        this.timestamps = false;
        this.underscored = true;
        this.freezeTableName = true;
        this.tableName = tableName;
    }
}

module.exports.DefaultModelConfig = DefaultModelConfig;
//console.log(Object.prototype);
// Object.__proto__.isEmpty = function () {
//     return underscore.isEmpty(this);
// };

module.exports.addColumns = function (columns, DataTypes) {
    return underscore.extend(columns, {
        "createdOn": {type: DataTypes.DATE, allowNull: false, field: "created_on"},
        "updatedOn": {type: DataTypes.DATE, allowNull: false, field: "updated_on"}
    });
};