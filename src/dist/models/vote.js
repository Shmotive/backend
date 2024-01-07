'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Vote extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Vote.init({
        user_uuid: DataTypes.STRING,
        session_id: DataTypes.STRING,
        recommendation_id: DataTypes.STRING,
        vote: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Vote',
        underscored: true,
    });
    return Vote;
};
