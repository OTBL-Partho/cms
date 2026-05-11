'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RoasterSchedules', {
      id:    { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
      date:  { type: Sequelize.DATEONLY, allowNull: false },
      day:   { type: Sequelize.STRING,   allowNull: true  },
      name:  { type: Sequelize.STRING,   allowNull: false },
      email: { type: Sequelize.STRING,   allowNull: true  },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('RoasterSchedules');
  },
};
