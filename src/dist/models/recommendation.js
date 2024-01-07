'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Recommendation extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Recommendation.init({
        name: DataTypes.STRING,
        category: DataTypes.STRING,
        price_range: DataTypes.RANGE(DataTypes.INTEGER)
    }, {
        sequelize,
        modelName: 'Recommendation',
        underscored: true,
    });
    return Recommendation;
};
