'use strict';
const { MotiveSessionState } = require('../config/enums');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('MotiveSessions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            lobby_code: {
                type: Sequelize.STRING
            },
            state: {
                type: Sequelize.ENUM,
                values: Object.values(MotiveSessionState)
            },
            owner: {
                type: Sequelize.STRING
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('MotiveSessions');
    }
};
