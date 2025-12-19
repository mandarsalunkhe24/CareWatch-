const VitalReading = require('../models/VitalReading');
const asyncHandler = require('../middleware/async');

const toClient = (doc) => {
  return {
    id: doc._id.toString(),
    ts: doc.ts.toISOString(),
    systolic: doc.systolic,
    diastolic: doc.diastolic,
    hr: doc.hr,
    elderName: doc.elderName,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

exports.listVitals = asyncHandler(async (req, res) => {
  const vitals = await VitalReading.find({}).sort({ ts: 1 });
  res.status(200).json({ success: true, data: vitals.map(toClient) });
});

exports.createVital = asyncHandler(async (req, res) => {
  const { systolic, diastolic, hr, elderName } = req.body;
  const created = await VitalReading.create({ systolic, diastolic, hr, elderName });
  res.status(201).json({ success: true, data: toClient(created) });
});
