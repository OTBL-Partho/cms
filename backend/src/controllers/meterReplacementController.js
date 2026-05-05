const csv = require('csv-parser');
const { Readable } = require('stream');
const { enrichAndValidateRow } = require('../services/meterEnrichmentService');

const processMeterReplacementData = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const results = [];
  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      try {
        const processedData = await Promise.all(results.map(enrichAndValidateRow));
        // Deduplicate by Customer ID (keep first occurrence)
        const uniqueByCustomer = new Map();
        for (const row of processedData) {
          const key = row['Customer ID'] || row['CUSTID'] || '';
          if (key && !uniqueByCustomer.has(key)) {
            uniqueByCustomer.set(key, row);
          }
          if (!key) {
            uniqueByCustomer.set(`__no_id__${uniqueByCustomer.size + 1}`, row);
          }
        }
        res.json(Array.from(uniqueByCustomer.values()));
      } catch (error) {
        res.status(500).send(`Error processing data: ${error.message}`);
      }
    });
};

const processSingleRow = async (req, res) => {
  try {
    const row = req.body || {};
    const processed = await enrichAndValidateRow(row);
    return res.json(processed);
  } catch (error) {
    return res.status(500).send(`Error processing row: ${error.message}`);
  }
};

const getMeterReplacementHistory = async (req, res) => {
  try {
    const { meterNo } = req.params;
    if (!meterNo) {
      return res.status(400).json({ error: 'Meter number is required' });
    }

    const { MeterReplacement } = require('../models');
    const replacements = await MeterReplacement.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { oldMeterNumber: meterNo },
          { replaceMeterNumber: meterNo }
        ]
      },
      order: [['replaceDate', 'DESC']]
    });

    const formattedReplacements = replacements.map(r => ({
      id: r.id,
      customerId: r.customerId,
      oldMeterNumber: r.oldMeterNumber,
      replaceMeterNumber: r.replaceMeterNumber,
      installDate: r.installDate,
      replaceDate: r.replaceDate,
      lastBillDate: r.lastBillDate,
      oldMeterLastReads: r.oldMeterLastReads,
      reason: r.oldMeterNumber === meterNo ? 'This meter was replaced' : 'This meter replaced another meter',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));

    res.json({
      meterNumber: meterNo,
      totalReplacements: formattedReplacements.length,
      replacements: formattedReplacements
    });
  } catch (error) {
    console.error('Error fetching meter replacement history:', error);
    res.status(500).json({ error: 'Error fetching replacement history', message: error.message });
  }
};

module.exports = { processMeterReplacementData, processSingleRow, getMeterReplacementHistory };
