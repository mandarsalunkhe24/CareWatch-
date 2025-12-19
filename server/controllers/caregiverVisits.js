const CaregiverVisit = require('../models/CaregiverVisit');
const asyncHandler = require('../middleware/async');

const toClient = (doc) => {
  return {
    id: doc._id.toString(),
    caregiverName: doc.caregiverName,
    elderName: doc.elderName,
    visitedAt: doc.visitedAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

exports.listVisits = asyncHandler(async (req, res) => {
  const visits = await CaregiverVisit.find({}).sort({ visitedAt: -1 });
  res.status(200).json({ success: true, data: visits.map(toClient) });
});

exports.createVisit = asyncHandler(async (req, res) => {
  const { caregiverName, elderName, visitedAt } = req.body;
  const created = await CaregiverVisit.create({ caregiverName, elderName, ...(visitedAt ? { visitedAt } : {}) });
  res.status(201).json({ success: true, data: toClient(created) });
});
