'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MotiveSessionHistory extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    MotiveSessionHistory.init({
        user_uuid: DataTypes.STRING,
        sessionId: DataTypes.STRING,
        joined_at: DataTypes.DATE,
        completed_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'MotiveSessionHistory',
        underscored: true,
    });
    return MotiveSessionHistory;
};
