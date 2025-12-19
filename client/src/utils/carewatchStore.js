import { loadJSON, saveJSON } from './storage';

const SOS_KEY = 'cw_sos_alerts';
const VITALS_KEY = 'cw_vitals_history';
const VISITS_KEY = 'cw_caregiver_visits';

const uid = () => {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const getSosAlerts = () => {
  return loadJSON(SOS_KEY, []);
};

export const addSosAlert = ({ elderName = 'Elder', location = 'Kharghar, Navi Mumbai' } = {}) => {
  const alerts = getSosAlerts();
  const next = [
    {
      id: uid(),
      elderName,
      location,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignedTo: null,
      updatedAt: new Date().toISOString(),
    },
    ...alerts,
  ];
  saveJSON(SOS_KEY, next);
  return next[0];
};

export const updateSosAlert = (id, patch) => {
  const alerts = getSosAlerts();
  const next = alerts.map((a) => (a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a));
  saveJSON(SOS_KEY, next);
  return next.find((a) => a.id === id) || null;
};

export const getVisits = () => {
  return loadJSON(VISITS_KEY, []);
};

export const addVisit = ({ caregiverName = 'Caregiver', elderName = 'Elder' } = {}) => {
  const visits = getVisits();
  const next = [
    {
      id: uid(),
      caregiverName,
      elderName,
      visitedAt: new Date().toISOString(),
    },
    ...visits,
  ];
  saveJSON(VISITS_KEY, next);
  return next[0];
};

export const getVitals = () => {
  return loadJSON(VITALS_KEY, []);
};

export const seedVitalsIfEmpty = () => {
  const existing = getVitals();
  if (existing.length > 0) return existing;

  const now = Date.now();
  const seeded = [
    { ts: new Date(now - 6 * 3600_000).toISOString(), systolic: 128, diastolic: 82, hr: 76 },
    { ts: new Date(now - 4 * 3600_000).toISOString(), systolic: 134, diastolic: 86, hr: 80 },
    { ts: new Date(now - 2 * 3600_000).toISOString(), systolic: 148, diastolic: 92, hr: 88 },
    { ts: new Date(now - 1 * 3600_000).toISOString(), systolic: 138, diastolic: 89, hr: 84 },
    { ts: new Date(now - 15 * 60_000).toISOString(), systolic: 132, diastolic: 85, hr: 78 },
  ];

  saveJSON(VITALS_KEY, seeded);
  return seeded;
};

export const addVital = ({ systolic, diastolic, hr }) => {
  const vitals = getVitals();
  const next = [
    ...vitals,
    {
      ts: new Date().toISOString(),
      systolic,
      diastolic,
      hr,
    },
  ];
  saveJSON(VITALS_KEY, next);
  return next[next.length - 1];
};

export const getMonthlySummary = (monthDate = new Date()) => {
  const month = monthDate.getMonth();
  const year = monthDate.getFullYear();

  const alerts = getSosAlerts();
  const vitals = getVitals();
  const visits = getVisits();

  const inMonth = (iso) => {
    const d = new Date(iso);
    return d.getMonth() === month && d.getFullYear() === year;
  };

  const monthAlerts = alerts.filter((a) => inMonth(a.createdAt));
  const monthVitals = vitals.filter((v) => inMonth(v.ts));
  const monthVisits = visits.filter((v) => inMonth(v.visitedAt));

  const avg = (nums) => {
    if (!nums.length) return null;
    return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
  };

  const avgSys = avg(monthVitals.map((v) => v.systolic));
  const avgDia = avg(monthVitals.map((v) => v.diastolic));
  const avgHr = avg(monthVitals.map((v) => v.hr));

  return {
    totalSos: monthAlerts.length,
    avgBp: avgSys && avgDia ? `${avgSys}/${avgDia}` : '—',
    avgHr: avgHr ?? '—',
    caregiverVisits: monthVisits.length,
  };
};
