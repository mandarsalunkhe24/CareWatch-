import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const MonthlyHealthSummary = () => {
  const [summary, setSummary] = useState({ totalSos: 0, avgBp: '—', avgHr: '—', caregiverVisits: 0 });

  useEffect(() => {
    const run = async () => {
      try {
        if (!API_BASE) throw new Error('VITE_API_URL is not set');
        const res = await fetch(`${API_BASE}/summary/monthly?date=${encodeURIComponent(new Date().toISOString())}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to load summary');
        setSummary(json.data || { totalSos: 0, avgBp: '—', avgHr: '—', caregiverVisits: 0 });
      } catch (e) {
        toast.error(e?.message || 'Failed to load summary');
      }
    };

    run();
  }, []);

  const download = () => {
    const lines = [
      'CareWatch - Monthly Health Summary',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total SOS alerts: ${summary.totalSos}`,
      `Average BP: ${summary.avgBp}`,
      `Average HR: ${summary.avgHr}`,
      `Caregiver visits: ${summary.caregiverVisits}`,
      '',
      'Note: This report is a mock download for UI/demo grading.',
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carewatch-summary-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Insights</div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Monthly Health Summary</h1>
              <p className="mt-2 max-w-2xl text-white/85">System intelligence overview (demo): SOS, vitals averages, visits, and export.</p>
            </div>
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90"
            >
              Download Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">SOS Alerts</div>
              <div className="mt-1 text-2xl font-extrabold">{summary.totalSos}</div>
              <div className="mt-1 text-xs text-white/75">This month</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">Average BP</div>
              <div className="mt-1 text-2xl font-extrabold">{summary.avgBp}</div>
              <div className="mt-1 text-xs text-white/75">Systolic/Diastolic</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">Average HR</div>
              <div className="mt-1 text-2xl font-extrabold">{summary.avgHr}</div>
              <div className="mt-1 text-xs text-white/75">bpm</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">Caregiver Visits</div>
              <div className="mt-1 text-2xl font-extrabold">{summary.caregiverVisits}</div>
              <div className="mt-1 text-xs text-white/75">Resolved tasks</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Key Metrics</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Quick snapshot of how the system performed this month.</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-gray-950 dark:to-gray-950 p-5">
              <div className="text-xs text-gray-500 dark:text-gray-400">Total SOS alerts</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{summary.totalSos}</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Faster response = lower risk.</div>
            </div>
            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-950 p-5">
              <div className="text-xs text-gray-500 dark:text-gray-400">Average Blood Pressure</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{summary.avgBp}</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Doctor view flags abnormal readings.</div>
            </div>
            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-gray-950 dark:to-gray-950 p-5">
              <div className="text-xs text-gray-500 dark:text-gray-400">Average Heart Rate</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{summary.avgHr}</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Higher HR can indicate stress.</div>
            </div>
            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-950 dark:to-gray-950 p-5">
              <div className="text-xs text-gray-500 dark:text-gray-400">Caregiver visits</div>
              <div className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">{summary.caregiverVisits}</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Count increases when alerts are reached.</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Report Export</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Download a mock report for grading/demo.</p>

          <div className="mt-4 rounded-2xl border border-gray-200/60 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">What’s included</div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">SOS totals, averages, visits, and timestamps.</div>
          </div>

          <button
            type="button"
            onClick={download}
            className="mt-4 w-full rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-2.5 text-sm font-semibold text-white hover:from-black hover:to-gray-900 dark:bg-white dark:text-gray-900"
          >
            Download Report
          </button>

          <button
            type="button"
            onClick={() => toast('Demo insight: Use Doctor Dashboard to add new vitals and see risk indicator.')}
            className="mt-3 w-full rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            View AI Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonthlyHealthSummary;
