import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { Sensor, UserRole, getSensorExpiry, SensorExpiry } from "../types";
import { API_CONFIG } from "../config";

interface SensorsProps {
  sensors: Sensor[];
  setSensors: React.Dispatch<React.SetStateAction<Sensor[]>>;
  role: UserRole;
}

const expiryConfig: Record<SensorExpiry, { label: string; badge: string; row: string }> = {
  VALID: { label: "Valid", badge: "bg-emerald-100 text-emerald-800", row: "" },
  EXPIRING_SOON: { label: "Expiring Soon", badge: "bg-amber-100  text-amber-800", row: "bg-amber-50" },
  EXPIRED: { label: "Expired", badge: "bg-red-100    text-red-800", row: "bg-red-50" },
};

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const Sensors: React.FC<SensorsProps> = ({ sensors, setSensors, role }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("Main Library");
  const [newType, setNewType] = useState("TEMPERATURE");
  const [isDeploying, setIsDeploying] = useState(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const isAdmin = role === UserRole.ADMIN;

  const toggleStatus = async (id: string) => {
    if (!isAdmin) return;
    const sensor = sensors.find(s => s.id === id);
    if (!sensor) return;

    let newStatus = "HIGH";
    if (sensor.status === "HIGH") newStatus = "MEDIUM";
    else if (sensor.status === "MEDIUM") newStatus = "LOW";
    else if (sensor.status === "LOW") newStatus = "HIGH";

    try {
      await fetch(`${API_CONFIG.ENDPOINTS.SENSORS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setSensors(prev => prev.map(s => (s.id === id ? { ...s, status: newStatus as any } : s)));
      toast.success('Sensor capacity threshold updated');
    } catch (e) {
      console.error('Error toggling status', e);
      toast.error('Failed to update sensor. API error.');
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    if (!isAdmin) return;
    
    try {
      await fetch(`${API_CONFIG.ENDPOINTS.SENSORS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });
      setSensors(prev => prev.map(s => (s.id === id ? { ...s, isActive: !currentActive } : s)));
      toast.success(currentActive ? 'Sensor powered off' : 'Sensor powered on');
    } catch (e) {
      console.error('Error toggling power state', e);
      toast.error('Failed to update sensor power state.');
    }
  };

  const deleteSensor = async (id: string) => {
    if (!isAdmin) return;
    try {
      await fetch(`${API_CONFIG.ENDPOINTS.SENSORS}/${id}`, { method: 'DELETE' });
      setSensors(prev => prev.filter(s => s.id !== id));
      toast.success('Sensor isolated and removed from network');
    } catch (e) {
      console.error('Error deleting sensor', e);
      toast.error('Failed to disconnect sensor.');
    }
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setIsDeploying(true);

    try {
      const resp = await fetch(API_CONFIG.ENDPOINTS.SENSORS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: newLocation, type: newType })
      });
      const data = await resp.json();
      if (data.success && data.sensor) {
        setSensors(prev => [...prev, data.sensor]);
        setIsModalOpen(false);
        toast.success(`New ${newType} sensor deployed at ${newLocation}`);
      }
    } catch (err) {
      console.error('Failed to deploy sensor', err);
      toast.error('Deployment failed. Check API connection.');
    } finally {
      setIsDeploying(false);
    }
  };

  const expiredCount = sensors.filter(s => getSensorExpiry(s.expiryDate) === "EXPIRED").length;
  const expiringSoonCount = sensors.filter(s => getSensorExpiry(s.expiryDate) === "EXPIRING_SOON").length;

  const filteredSensors = sensors.filter(sensor => {
    const matchesSearch = sensor.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sensor.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "ALL" || sensor.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Campus Sensor Network</h3>
            <p className="text-sm text-slate-500 mt-1">Manage and monitor all IoT deployment points</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Deploy New Sensor
            </button>
          )}
        </div>

        {/* Expiry summary banners */}
        {(expiredCount > 0 || expiringSoonCount > 0) && (
          <div className="mt-4 flex flex-wrap gap-3">
            {expiredCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block" />
                {expiredCount} sensor{expiredCount > 1 ? "s" : ""} expired — immediate replacement required
              </div>
            )}
            {expiringSoonCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 font-medium">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block" />
                {expiringSoonCount} sensor{expiringSoonCount > 1 ? "s" : ""} expiring within 30 days
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            type="text"
            placeholder="Search by Location or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-700 font-medium"
        >
          <option value="ALL">All Statuses</option>
          <option value="HIGH">High (Critical)</option>
          <option value="MEDIUM">Medium (Warning)</option>
          <option value="LOW">Low (Normal)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-4">Sensor ID</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Reading</th>
                <th className="px-5 py-4">Install Date</th>
                <th className="px-5 py-4">Expiry Date</th>
                <th className="px-5 py-4">Utilization</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSensors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                    No sensors found matching your criteria.
                  </td>
                </tr>
              ) : filteredSensors.map(sensor => {
                const expiry = getSensorExpiry(sensor.expiryDate);
                const cfg = expiryConfig[expiry];
                return (
                  <tr key={sensor.id} className={`hover:bg-slate-50 transition-colors ${cfg.row}`}>
                    <td className="px-5 py-4 font-mono text-slate-500">{sensor.id}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{sensor.location}</td>
                    <td className="px-5 py-4">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-medium text-xs">
                        {sensor.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">
                      {sensor.lastReading} {sensor.unit}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{fmt(sensor.installDate)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[11px] text-slate-400">{fmt(sensor.expiryDate)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${sensor.isActive === false ? "bg-slate-300" :
                                sensor.status === "HIGH" ? "bg-red-500"
                                  : sensor.status === "MEDIUM" ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                            style={{ width: `${sensor.isActive === false ? 0 : sensor.status === "HIGH" ? 95 : sensor.status === "MEDIUM" ? 65 : 30}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600 font-medium">
                          {sensor.isActive === false ? "0" : sensor.status === "HIGH" ? "95" : sensor.status === "MEDIUM" ? "65" : "30"}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sensor.status === "HIGH" ? "bg-emerald-100 text-emerald-800" :
                            sensor.status === "MEDIUM" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                          }`}>
                          {sensor.status}
                        </span>
                        
                        <button
                          onClick={() => toggleActive(sensor.id, sensor.isActive !== false)}
                          disabled={!isAdmin}
                          className={`mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-colors ${
                            sensor.isActive !== false 
                              ? "border-sky-200 bg-sky-50 text-sky-600 hover:bg-sky-100" 
                              : "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
                          } ${!isAdmin && "opacity-60 cursor-not-allowed"}`}
                        >
                          {sensor.isActive !== false ? "PWR: ON" : "PWR: OFF"}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleStatus(sensor.id)}
                          disabled={!isAdmin}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-md ${isAdmin ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-slate-50 text-slate-300"
                            }`}
                        >
                          Change Level
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => deleteSensor(sensor.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            title="Remove sensor"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deploy modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Deploy New Sensor</h3>
            <p className="text-sm text-slate-500 mb-6">Provision a new physical sensor device on the campus network.</p>

            <form onSubmit={handleDeploy} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Location Zone</label>
                <select
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50"
                >
                  <option value="Sathyamangalam">Sathyamangalam</option>
                  <option value="Main Library">Main Library</option>
                  <option value="Science Block A">Science Block A</option>
                  <option value="Student Union">Student Union</option>
                  <option value="Cafeteria">Cafeteria</option>
                  <option value="Gymnasium">Gymnasium</option>
                  <option value="Auditorium">Auditorium</option>
                  <option value="Admin Building">Admin Building</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sensor Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-slate-50"
                >
                  <option value="TEMPERATURE">Temperature Sensor</option>
                  <option value="HUMIDITY">Humidity Module</option>
                  <option value="AIR_QUALITY">Air Quality (AQI) Monitor</option>
                  <option value="NOISE">Acoustic / Noise Tracker</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeploying}
                  className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  {isDeploying ? 'Deploying...' : 'Provision Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sensors;
