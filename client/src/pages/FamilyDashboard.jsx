import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const FamilyDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [summary, setSummary] = useState({ totalSos: 0, avgBp: '—', avgHr: '—', caregiverVisits: 0 });

  const location = useMemo(() => ({
    name: 'Kharghar, Navi Mumbai',
    lat: 19.0468,
    lon: 73.0698,
  }), []);

  useEffect(() => {
    const run = async () => {
      try {
        if (!API_BASE) throw new Error('VITE_API_URL is not set');

        const [aRes, vRes, sRes] = await Promise.all([
          fetch(`${API_BASE}/sos-alerts`),
          fetch(`${API_BASE}/vitals`),
          fetch(`${API_BASE}/summary/monthly?date=${encodeURIComponent(new Date().toISOString())}`),
        ]);

        const aJson = await aRes.json();
        if (!aRes.ok) throw new Error(aJson?.message || 'Failed to load SOS alerts');
        setAlerts(aJson.data || []);

        const vJson = await vRes.json();
        if (!vRes.ok) throw new Error(vJson?.message || 'Failed to load vitals');
        setVitals(vJson.data || []);

        const sJson = await sRes.json();
        if (!sRes.ok) throw new Error(sJson?.message || 'Failed to load summary');
        setSummary(sJson.data || { totalSos: 0, avgBp: '—', avgHr: '—', caregiverVisits: 0 });
      } catch (e) {
        toast.error(e?.message || 'Failed to load dashboard data');
      }
    };

    run();
  }, []);

  const latest = useMemo(() => {
    if (!vitals.length) return null;
    return vitals[vitals.length - 1];
  }, [vitals]);

  const statusBadge = (status) => {
    if (status === 'reached') return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-900';
    if (status === 'assigned') return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900';
    return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-900';
  };

  const mapSrc = useMemo(() => {
    const dLat = 0.012;
    const dLon = 0.012;
    const left = location.lon - dLon;
    const right = location.lon + dLon;
    const top = location.lat + dLat;
    const bottom = location.lat - dLat;
    const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`;
    const marker = `${location.lat}%2C${location.lon}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
  }, [location.lat, location.lon]);

  const copyCoords = async () => {
    const text = `${location.lat}, ${location.lon}`;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast.success('Coordinates copied');
      } else {
        toast(text);
      }
    } catch {
      toast(text);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-600 p-6 sm:p-8 text-white shadow-lg">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  Live Monitor
                </div>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Family Dashboard</h1>
                <p className="mt-2 max-w-2xl text-white/85">
                  Track vitals, see real-time location, and respond fast to SOS alerts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/elder-sos"
                  className="inline-flex items-center justify-center rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/20"
                >
                  Elder SOS
                </Link>
                <Link
                  to="/summary"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90"
                >
                  Monthly Summary
                </Link>
              </div>
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
                <div className="text-xs text-white/80">SOS This Month</div>
                <div className="mt-1 text-2xl font-extrabold">{summary.totalSos}</div>
                <div className="mt-1 text-xs text-white/75">Avg BP {summary.avgBp}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Vitals Overview</h2>
              <span className="text-xs text-gray-500 dark:text-gray-400">Latest reading</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-4 border border-gray-200/60 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">BP</div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {latest ? `${latest.systolic}/${latest.diastolic}` : '—'}
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-fuchsia-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 p-4 border border-gray-200/60 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Heart Rate</div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{latest ? `${latest.hr}` : '—'}</div>
              </div>
              <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400">
                {latest ? new Date(latest.ts).toLocaleString() : 'No vitals yet'}
              </div>
            </div>
            <div className="mt-4">
              <Link
                to="/doctor"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View Doctor Dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300">{location.name}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Last ping: just now</p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Coords: <span className="font-semibold">{location.lat.toFixed(4)}, {location.lon.toFixed(4)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={copyCoords}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Copy Coords
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:from-blue-700 hover:to-indigo-700"
                >
                  Directions
                </a>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${location.lat}&mlon=${location.lon}#map=16/${location.lat}/${location.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Open Map
                </a>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-950">
              <iframe
                title="Elder location map"
                src={mapSrc}
                className="h-56 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-200/60 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Zone</div>
                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Safe</div>
              </div>
              <div className="rounded-xl border border-gray-200/60 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Movement</div>
                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">Low</div>
              </div>
              <div className="rounded-xl border border-gray-200/60 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
                <div className="text-[11px] text-gray-500 dark:text-gray-400">Battery</div>
                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">82%</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">This Month</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200/60 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">SOS Alerts</div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{summary.totalSos}</div>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200/60 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Avg BP</div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{summary.avgBp}</div>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200/60 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Avg HR</div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{summary.avgHr}</div>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 border border-gray-200/60 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Caregiver Visits</div>
                <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{summary.caregiverVisits}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast('This is a demo summary. Use Monthly Summary for report.')}
              className="mt-4 w-full rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black/90 dark:bg-white dark:text-gray-900"
            >
              View insights
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Alerts</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Status: Pending / Caregiver Assigned / Reached</p>
            </div>
            <button
              type="button"
              onClick={() => {
                (async () => {
                  try {
                    if (!API_BASE) throw new Error('VITE_API_URL is not set');
                    const res = await fetch(`${API_BASE}/sos-alerts`);
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.message || 'Failed to load SOS alerts');
                    setAlerts(json.data || []);
                    toast.success('Refreshed alerts');
                  } catch (e) {
                    toast.error(e?.message || 'Failed to refresh');
                  }
                })();
              }}
              className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Elder</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Assigned</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {alerts.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300" colSpan={5}>
                      No SOS alerts yet. If the elder presses SOS, it will show here.
                    </td>
                  </tr>
                ) : (
                  alerts.slice(0, 8).map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">{a.elderName}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{a.location}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadge(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">{a.assignedTo ?? '—'}</td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboard;
