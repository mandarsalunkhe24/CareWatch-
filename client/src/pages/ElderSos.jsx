import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const ElderSos = () => {
  const [elderName, setElderName] = useState('Grandpa Raj');
  const [location, setLocation] = useState('Kharghar, Navi Mumbai');
  const [loading, setLoading] = useState(false);

  const coords = useMemo(() => ({ lat: 19.0468, lon: 73.0698 }), []);

  const helperText = useMemo(() => {
    return loading ? 'Sending SOS…' : 'Press only in emergency.';
  }, [loading]);

  const sendSos = async () => {
    setLoading(true);
    try {
      if (!API_BASE) throw new Error('VITE_API_URL is not set');

      const res = await fetch(`${API_BASE}/sos-alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elderName, location }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to create SOS alert');

      const created = json.data;
      toast.success(`Help is on the way. Alert #${created.id.slice(-5)}`);
    } catch (e) {
      toast.error(e?.message || 'Failed to send SOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-fuchsia-600 p-6 sm:p-8 text-white shadow-lg">
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 h-72 w-72 rounded-full bg-black/10 blur-2xl" />

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Emergency
              </div>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Elder SOS</h1>
              <p className="mt-2 max-w-2xl text-white/85">
                One tap sends an SOS alert to your family + caregiver with your last known location.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lon}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-white/90"
              >
                Directions
              </a>
              <a
                href="tel:112"
                className="inline-flex items-center justify-center rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/20"
              >
                Call 112
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Trigger</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Press the button only if you need immediate help.</p>
            </div>
            <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">Location ready</div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Elder Name</label>
              <input
                value={elderName}
                onChange={(e) => setElderName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Current Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white"
              />
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Coords: <span className="font-semibold">{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/35 blur-2xl" />
              <div className="absolute -inset-2 rounded-full border border-red-300/50 animate-ping" />
              <div className="absolute -inset-5 rounded-full border border-white/15" />
              <button
                type="button"
                disabled={loading}
                onClick={sendSos}
                className="relative h-44 w-44 rounded-full bg-gradient-to-br from-red-600 to-rose-600 text-white text-2xl font-extrabold shadow-xl hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-red-300 disabled:opacity-60"
              >
                SOS
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">{helperText}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Saved to MongoDB Atlas and will appear in Family + Caregiver dashboards.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Tips</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-gray-200/60 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">When to use SOS</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Chest pain, fall, breathing trouble, sudden weakness.</div>
            </div>
            <div className="rounded-xl border border-gray-200/60 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">What happens next</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Caregiver gets assigned, family sees status updates.</div>
            </div>
            <div className="rounded-xl border border-gray-200/60 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-950 dark:to-gray-950 p-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Emergency Contact</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Call your local emergency number if needed.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElderSos;
