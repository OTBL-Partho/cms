const RoasterSchedule = require('../models/RoasterSchedule');
const sequelize = require('../config/database');

exports.getRoaster = async (req, res) => {
  try {
    const rows = await RoasterSchedule.findAll({ order: [['date', 'ASC']] });
    return res.json({ success: true, data: rows.map(r => ({
      date:       r.date,
      day:        r.day        || '',
      name:       r.name,
      email:      r.email      || '',
      assignment: r.assignment || null,
    }))});
  } catch (error) {
    console.error('getRoaster error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch roaster' });
  }
};

exports.saveRoaster = async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, message: 'entries array required' });
    }

    const rows = entries
      .filter(e => e.date && e.name)
      .map(e => ({
        date:       String(e.date).trim().slice(0, 10),
        day:        String(e.day        || '').trim(),
        name:       String(e.name       ).trim(),
        email:      String(e.email      || '').trim() || null,
        assignment: e.assignment ? String(e.assignment).trim() || null : null,
      }));

    await sequelize.transaction(async (t) => {
      await RoasterSchedule.destroy({ where: {}, truncate: true, transaction: t });
      await RoasterSchedule.bulkCreate(rows, { transaction: t });
    });

    return res.json({ success: true, saved: rows.length });
  } catch (error) {
    console.error('saveRoaster error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save roaster' });
  }
};
