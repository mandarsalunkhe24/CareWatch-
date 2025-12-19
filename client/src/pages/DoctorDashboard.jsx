import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { loadJSON, saveJSON } from '../utils/storage';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const NOTES_KEY = 'cw_doctor_notes';

const DoctorDashboard = () => {
  const [vitals, setVitals] = useState([]);
  const [notes, setNotes] = useState('');
  const [bpS, setBpS] = useState('');
  const [bpD, setBpD] = useState('');
  const [hr, setHr] = useState('');

  useEffect(() => {
    const run = async () => {
      try {
        setNotes(loadJSON(NOTES_KEY, ''));
        if (!API_BASE) throw new Error('VITE_API_URL is not set');

        const res = await fetch(`${API_BASE}/vitals`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to load vitals');
        setVitals(json.data || []);
      } catch (e) {
        toast.error(e?.message || 'Failed to load vitals');
      }
    };

    run();
  }, []);

  const latest = useMemo(() => {
    if (!vitals.length) return null;
    return vitals[vitals.length - 1];
  }, [vitals]);

  const risk = useMemo(() => {
    if (!latest) return { label: 'No data', tone: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800' };
    const highBp = latest.systolic >= 140 || latest.diastolic >= 90;
    const highHr = latest.hr >= 100;

    if (highBp || highHr) {
      return { label: 'High BP Alert', tone: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-900' };
    }
    return { label: 'Normal', tone: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900' };
  }, [latest]);

  const saveNotes = () => {
    saveJSON(NOTES_KEY, notes);
    toast.success('Notes saved');
  };

  const addReading = async () => {
    const systolic = Number(bpS);
    const diastolic = Number(bpD);
    const heart = Number(hr);

    if (!systolic || !diastolic || !heart) {
      toast.error('Enter BP + HR');
      return;
    }

    try {
      if (!API_BASE) throw new Error('VITE_API_URL is not set');

      const res = await fetch(`${API_BASE}/vitals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systolic, diastolic, hr: heart }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to record vitals');

      const next = [...vitals, json.data];
      setVitals(next);
      setBpS('');
      setBpD('');
      setHr('');
      toast.success('Vitals recorded');
    } catch (e) {
      toast.error(e?.message || 'Failed to record vitals');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Clinical View</div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Doctor Dashboard</h1>
              <p className="mt-2 max-w-2xl text-white/85">Vitals trend analysis + basic AI highlighting abnormal readings.</p>
            </div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${risk.tone}`}>
              {risk.label}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">Latest BP</div>
              <div className="mt-1 text-2xl font-extrabold">{latest ? `${latest.systolic}/${latest.diastolic}` : '—'}</div>
              <div className="mt-1 text-xs text-white/75">{latest ? new Date(latest.ts).toLocaleString() : 'No vitals yet'}</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">Heart Rate</div>
              <div className="mt-1 text-2xl font-extrabold">{latest ? `${latest.hr}` : '—'}</div>
              <div className="mt-1 text-xs text-white/75">bpm</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">AI Insight</div>
              <div className="mt-1 text-2xl font-extrabold">{risk.label}</div>
              <div className="mt-1 text-xs text-white/75">Auto-flag when BP ≥ 140/90 or HR ≥ 100</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vitals Trend</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">BP history + Heart rate history (table view).</p>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">BP</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">HR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {vitals.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300" colSpan={3}>
                      No vitals history.
                    </td>
                  </tr>
                ) : (
                  [...vitals]
                    .slice(-10)
                    .reverse()
                    .map((v) => (
                      <tr key={v.ts} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(v.ts).toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {v.systolic}/{v.diastolic}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{v.hr}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={bpS}
              onChange={(e) => setBpS(e.target.value)}
              placeholder="Systolic (e.g. 130)"
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
            />
            <input
              value={bpD}
              onChange={(e) => setBpD(e.target.value)}
              placeholder="Diastolic (e.g. 85)"
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
            />
            <input
              value={hr}
              onChange={(e) => setHr(e.target.value)}
              placeholder="Heart Rate (e.g. 78)"
              className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={addReading}
              className="md:col-span-3 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white px-4 py-2.5 text-sm font-semibold hover:from-black hover:to-gray-900 dark:bg-white dark:text-gray-900"
            >
              Add Vitals Reading
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Health Notes</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Observations + risk notes.</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={10}
            className="mt-4 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
            placeholder="Write observations…"
          />
          <button
            type="button"
            onClick={saveNotes}
            className="mt-3 w-full rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
          >
            Save Notes
          </button>

          <div className="mt-6 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">Risk Indicator</div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Basic AI logic highlights abnormal vitals (BP ≥ 140/90 or HR ≥ 100).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
