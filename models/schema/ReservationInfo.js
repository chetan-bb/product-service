/**
 * Created by anuranjit on 18/8/16.
 */
const base = require('./base');

module.exports = function (sequelize, DataTypes) {
    const ReservationInfo =  sequelize.define("ReservationInfo", base.addColumns({
        "id": {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    }, DataTypes), new base.DefaultModelConfig("warehouse_reservationinfo"));

    ReservationInfo.associate = function(dbModels, value){
        value.belongsTo(dbModels.City, {
            foreignKey: {
                allowNull: false,
                name: 'city_id'
            }
        });
    };
    return ReservationInfo;
};
