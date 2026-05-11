const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoasterSchedule = sequelize.define('RoasterSchedule', {
  date:       { type: DataTypes.DATEONLY, allowNull: false },
  day:        { type: DataTypes.STRING,   allowNull: true  },
  name:       { type: DataTypes.STRING,   allowNull: false },
  email:      { type: DataTypes.STRING,   allowNull: true  },
  assignment: { type: DataTypes.STRING,   allowNull: true  },
}, {
  tableName: 'RoasterSchedules',
  timestamps: false,
});

module.exports = RoasterSchedule;
