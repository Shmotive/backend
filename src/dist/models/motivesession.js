'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class MotiveSession extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    MotiveSession.init({
        lobby_code: DataTypes.STRING,
        state: DataTypes.STRING,
        owner: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'MotiveSession',
        underscored: true,
    });
    return MotiveSession;
};
