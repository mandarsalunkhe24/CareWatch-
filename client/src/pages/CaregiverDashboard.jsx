import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const CaregiverDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [caregiverName, setCaregiverName] = useState('Caregiver Asha');

  useEffect(() => {
    const run = async () => {
      try {
        if (!API_BASE) throw new Error('VITE_API_URL is not set');
        const res = await fetch(`${API_BASE}/sos-alerts`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Failed to load SOS alerts');
        setAlerts(json.data || []);
      } catch (e) {
        toast.error(e?.message || 'Failed to load SOS alerts');
      }
    };

    run();
  }, []);

  const assigned = useMemo(() => alerts.filter((a) => a.status === 'assigned' && a.assignedTo), [alerts]);
  const pending = useMemo(() => alerts.filter((a) => a.status === 'pending'), [alerts]);
  const reachedCount = useMemo(() => alerts.filter((a) => a.status === 'reached').length, [alerts]);

  const refresh = async () => {
    try {
      if (!API_BASE) throw new Error('VITE_API_URL is not set');
      const res = await fetch(`${API_BASE}/sos-alerts`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to load SOS alerts');
      setAlerts(json.data || []);
    } catch (e) {
      toast.error(e?.message || 'Failed to refresh');
    }
  };

  const accept = async (id) => {
    try {
      if (!API_BASE) throw new Error('VITE_API_URL is not set');
      const res = await fetch(`${API_BASE}/sos-alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'assigned', assignedTo: caregiverName }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to assign SOS');
      await refresh();
      toast.success('SOS assigned to you');
    } catch (e) {
      toast.error(e?.message || 'Failed to assign SOS');
    }
  };

  const reached = async (id, elderName) => {
    try {
      if (!API_BASE) throw new Error('VITE_API_URL is not set');

      const res = await fetch(`${API_BASE}/sos-alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reached' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to mark reached');

      const vRes = await fetch(`${API_BASE}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverName, elderName }),
      });
      const vJson = await vRes.json();
      if (!vRes.ok) throw new Error(vJson?.message || 'Failed to add visit');

      await refresh();
      toast.success('Marked as reached + visit added');
    } catch (e) {
      toast.error(e?.message || 'Failed to mark reached');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Response Center
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Caregiver Dashboard</h1>
              <p className="mt-2 max-w-2xl text-white/85">Accept SOS requests, mark reached, and track visits.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                refresh();
                toast.success('Refreshed');
              }}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">Pending</div>
              <div className="mt-1 text-2xl font-extrabold">{pending.length}</div>
              <div className="mt-1 text-xs text-white/75">Need assignment</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">Assigned</div>
              <div className="mt-1 text-2xl font-extrabold">{assigned.length}</div>
              <div className="mt-1 text-xs text-white/75">In progress</div>
            </div>
            <div className="rounded-2xl bg-white/15 p-4 backdrop-blur">
              <div className="text-xs text-white/80">Reached</div>
              <div className="mt-1 text-2xl font-extrabold">{reachedCount}</div>
              <div className="mt-1 text-xs text-white/75">Resolved</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Your Name</label>
        <input
          value={caregiverName}
          onChange={(e) => setCaregiverName(e.target.value)}
          className="mt-2 w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
        />
        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Tip: Accept SOS → Reached → it will count as a caregiver visit in Monthly Summary.
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Requests (Pending)</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Accept an SOS alert to handle it.</p>

          <div className="mt-4 space-y-3">
            {pending.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">No pending SOS alerts.</div>
            ) : (
              pending.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-950 dark:to-gray-950 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{a.elderName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{a.location}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(a.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => accept(a.id)}
                      className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned SOS</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Mark as reached once you arrive.</p>

          <div className="mt-4 space-y-3">
            {assigned.length === 0 ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">No assigned alerts for you yet.</div>
            ) : (
              assigned.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-950 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{a.elderName}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{a.location}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Assigned to: {a.assignedTo}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => reached(a.id, a.elderName)}
                      className="rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:from-emerald-700 hover:to-green-700"
                    >
                      Reached
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled Visits</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">(Mock UI) Add a visit after handling an alert.</p>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Tip: Accept SOS → Reached → it will count as a caregiver visit in Monthly Summary.
        </div>
      </div>
    </div>
  );
};

export default CaregiverDashboard;
