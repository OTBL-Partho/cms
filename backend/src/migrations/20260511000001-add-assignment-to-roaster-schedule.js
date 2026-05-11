'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('RoasterSchedules', 'assignment', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('RoasterSchedules', 'assignment');
  },
};
