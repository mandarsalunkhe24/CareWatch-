const SosAlert = require('../models/SosAlert');
const asyncHandler = require('../middleware/async');

const toClient = (doc) => {
  return {
    id: doc._id.toString(),
    elderName: doc.elderName,
    location: doc.location,
    status: doc.status,
    assignedTo: doc.assignedTo,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

exports.listSosAlerts = asyncHandler(async (req, res) => {
  const alerts = await SosAlert.find({}).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: alerts.map(toClient) });
});

exports.createSosAlert = asyncHandler(async (req, res) => {
  const { elderName, location } = req.body;
  const created = await SosAlert.create({ elderName, location });
  res.status(201).json({ success: true, data: toClient(created) });
});

exports.updateSosAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const patch = req.body || {};
  const updated = await SosAlert.findByIdAndUpdate(
    id,
    {
      ...(patch.status ? { status: patch.status } : {}),
      ...(Object.prototype.hasOwnProperty.call(patch, 'assignedTo') ? { assignedTo: patch.assignedTo } : {}),
    },
    { new: true, runValidators: true }
  );

  if (!updated) {
    res.status(404).json({ success: false, message: 'SOS alert not found' });
    return;
  }

  res.status(200).json({ success: true, data: toClient(updated) });
});
