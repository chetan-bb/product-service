"use strict";

const base = require('./base');

module.exports = function (sequelize, DataTypes) {

    // Initialize Model
    const TagValue = sequelize.define("TagValue",
        // Columns
        base.addColumns({
            "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
            "tagValue": {type: DataTypes.STRING(500), field: "tag_value"},
            "valueSlug": {type: DataTypes.STRING(500), field: "value_slug"},
            "displayOrder": {type: DataTypes.INTEGER, field: "display_order"},
            "isActive": {type: DataTypes.BOOLEAN, defaultValue: true, field: "is_active"},

            // below fields are only to raw query mapping, todo remove this after raw query remove
            "tagGroupId": {type: DataTypes.INTEGER, field: "tag_group_id"},
            "tagGroupAttributeType": {type: DataTypes.STRING(200), field: "attribute_type"},
            "tagGroupTypeSlug": {type: DataTypes.STRING(200), field: "type_slug"},
            "tagGroupCopyToParentChild": {type: DataTypes.BOOLEAN, defaultValue: false, field: "copy_to_parent_child"},
        }, DataTypes),
        // Configs,
        new base.DefaultModelConfig("tag_tagvalue"));

    // TagValue.associate = function (dbModels, value) {
    //     value.belongsTo(dbModels.TagGroup, {
    //         foreignKey: {
    //             allowNull: true,
    //             name: 'tag_group_id',
    //         }
    //     });
    // };
    return TagValue;
};