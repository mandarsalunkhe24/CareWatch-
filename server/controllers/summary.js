const SosAlert = require('../models/SosAlert');
const VitalReading = require('../models/VitalReading');
const CaregiverVisit = require('../models/CaregiverVisit');
const asyncHandler = require('../middleware/async');

const avg = (nums) => {
  if (!nums.length) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
};

exports.getMonthlySummary = asyncHandler(async (req, res) => {
  const monthDate = req.query.date ? new Date(req.query.date) : new Date();
  const month = monthDate.getMonth();
  const year = monthDate.getFullYear();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);

  const [alerts, vitals, visits] = await Promise.all([
    SosAlert.find({ createdAt: { $gte: monthStart, $lt: monthEnd } }),
    VitalReading.find({ ts: { $gte: monthStart, $lt: monthEnd } }),
    CaregiverVisit.find({ visitedAt: { $gte: monthStart, $lt: monthEnd } }),
  ]);

  const avgSys = avg(vitals.map((v) => v.systolic));
  const avgDia = avg(vitals.map((v) => v.diastolic));
  const avgHr = avg(vitals.map((v) => v.hr));

  res.status(200).json({
    success: true,
    data: {
      totalSos: alerts.length,
      avgBp: avgSys && avgDia ? `${avgSys}/${avgDia}` : '—',
      avgHr: avgHr ?? '—',
      caregiverVisits: visits.length,
    },
  });
});
