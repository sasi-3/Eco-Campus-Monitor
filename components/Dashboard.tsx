import React, { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Reading, Sensor, Alert, getSensorExpiry } from "../types";
import { ICONS, COLORS } from "../constants";
import { getEnvironmentalInsights } from "../services/geminiService";
import { Link } from "react-router-dom";

interface DashboardProps {
  readings: Reading[];
  sensors: Sensor[];
  alerts: Alert[];
}

const Dashboard: React.FC<DashboardProps> = ({ readings, sensors, alerts }) => {
  const [aiInsights, setAiInsights] = useState<string>("Analyzing campus environment...");
  const [isAiLoading, setIsAiLoading] = useState(true);
  const [aiReportGenerated, setAiReportGenerated] = useState(false);

  useEffect(() => {
    // Only generate the report once when we have gathered enough initial readings
    if (readings.length >= 5 && !aiReportGenerated) {
      setAiReportGenerated(true); // set early to avoid race conditions

      const fetchInsights = async () => {
        setIsAiLoading(true);
        const insights = await getEnvironmentalInsights(readings, sensors);
        setAiInsights(insights);
        setIsAiLoading(false);
      };
      fetchInsights();
    }
  }, [readings.length, sensors, aiReportGenerated]);

  const latest = readings[readings.length - 1] || { temperature: 0, humidity: 0, aqi: 0, noise: 0 };

  // Sensor expiry breakdown
  const expiredSensors = sensors.filter(s => getSensorExpiry(s.expiryDate) === "EXPIRED");
  const expiringSensors = sensors.filter(s => getSensorExpiry(s.expiryDate) === "EXPIRING_SOON");
  const validSensors = sensors.filter(s => getSensorExpiry(s.expiryDate) === "VALID");

  const aqiStatus = (aqi: number) => {
    if (aqi <= 50) return { label: "Good", cls: "bg-emerald-100 text-emerald-700" };
    if (aqi <= 100) return { label: "Moderate", cls: "bg-yellow-100  text-yellow-700" };
    if (aqi <= 150) return { label: "Unhealthy (Sensitive)", cls: "bg-orange-100 text-orange-700" };
    return { label: "Unhealthy", cls: "bg-red-100     text-red-700" };
  };
  const aqi = aqiStatus(latest.aqi);

  return (
    <div className="space-y-8">

      {/* ── Sensor Health Banner ── */}
      {(expiredSensors.length > 0 || expiringSensors.length > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Sensor Health Overview</h3>
              <p className="text-sm text-slate-500">Expiry and replacement status</p>
            </div>
            <Link
              to="/sensors"
              className="text-xs font-semibold text-sky-600 hover:underline"
            >
              View all sensors →
            </Link>
          </div>
          <div className="flex flex-wrap gap-4">
            {expiredSensors.length > 0 && (
              <div className="flex-1 min-w-[160px] flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-red-600 text-lg font-bold">{expiredSensors.length}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">Expired</p>
                  <p className="text-xs text-red-500">Replace immediately</p>
                </div>
              </div>
            )}
            {expiringSensors.length > 0 && (
              <div className="flex-1 min-w-[160px] flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <span className="text-amber-600 text-lg font-bold">{expiringSensors.length}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-700">Expiring Soon</p>
                  <p className="text-xs text-amber-500">Within 30 days</p>
                </div>
              </div>
            )}
            <div className="flex-1 min-w-[160px] flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-emerald-600 text-lg font-bold">{validSensors.length}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-700">Fully Valid</p>
                <p className="text-xs text-emerald-500">No action needed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Temperature"
          value={`${latest.temperature.toFixed(1)}°C`}
          badge={latest.temperature > 28 ? "Heat Risk" : latest.temperature < 18 ? "Cold" : "Normal"}
          badgeCls={latest.temperature > 28 ? "bg-rose-50 text-rose-600" : latest.temperature < 18 ? "bg-sky-50 text-sky-600" : "bg-emerald-50 text-emerald-600"}
          color="bg-orange-500"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />}
        />
        <StatCard
          label="Humidity"
          value={`${latest.humidity.toFixed(0)}%`}
          badge={latest.humidity < 30 ? "Dry Risk" : latest.humidity > 70 ? "Mould Risk" : "Comfortable"}
          badgeCls={latest.humidity < 30 || latest.humidity > 70 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}
          color="bg-sky-500"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
        />
        <StatCard
          label="Air Quality (AQI)"
          value={latest.aqi.toFixed(0)}
          badge={aqi.label}
          badgeCls={aqi.cls}
          color="bg-emerald-500"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />}
        />
        <StatCard
          label="Noise Level"
          value={`${latest.noise.toFixed(0)} dB`}
          badge={latest.noise > 80 ? "High" : "Normal"}
          badgeCls={latest.noise > 80 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}
          color="bg-violet-500"
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />}
        />
      </div>

      {/* ── Charts + AI ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Environmental Trends</h3>
              <p className="text-sm text-slate-500">Real-time tracking — Temperature, Humidity & AQI</p>
            </div>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 outline-none">
              <option>Last Hour</option>
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={readings}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.12} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke={COLORS.warning} strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" />
                <Area type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHumidity)" />
                <Area type="monotone" dataKey="aqi" name="AQI" stroke={COLORS.success} strokeWidth={2.5} fillOpacity={1} fill="url(#colorAQI)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
              <ICONS.Brain />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Campus Insights</h3>
              <p className="text-xs text-slate-400">Powered by Gemini AI</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 prose prose-invert prose-sm max-w-none text-slate-300">
            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                <p>Gemini is analysing campus data...</p>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ 
                __html: aiInsights
                  .replace(/### (.*)/g, '<h3 class="text-white font-bold mt-4 mb-2">$1</h3>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-sky-300">$1</strong>')
                  .replace(/\n/g, '<br/>') 
              }} />
            )}
          </div>

          <Link to="/reports" className="mt-6 w-full py-3 bg-sky-500 hover:bg-sky-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            Generate Detailed Report
          </Link>
        </div>
      </div>

      {/* ── Recent Alerts + Sensor Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Alerts</h3>
          <div className="space-y-3">
            {alerts.slice(0, 6).map(alert => (
              <div key={alert.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={`w-2 rounded-full flex-shrink-0 ${alert.severity === "CRITICAL" ? "bg-red-500" :
                    alert.severity === "WARNING" ? "bg-amber-500" : "bg-sky-400"
                  }`} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800 text-sm">{alert.location}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div className="text-center py-8 text-slate-400 italic">No recent alerts</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Sensor Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {sensors.map(sensor => {
              const expiry = getSensorExpiry(sensor.expiryDate);
              return (
                <Link to="/sensors" key={sensor.id} className="p-4 border border-slate-100 rounded-xl flex items-center gap-3 hover:bg-slate-50 transition-colors block">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${expiry === "EXPIRED" ? "bg-red-500" :
                      expiry === "EXPIRING_SOON" ? "bg-amber-500" : "bg-green-500"
                    }`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{sensor.location}</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">{sensor.type.replace("_", " ")} · {sensor.utilizationRate}%</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  badge?: string;
  badgeCls?: string;
  color: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, badge, badgeCls, color, icon }) => (
  <Link to="/sensors" className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group hover:shadow-md transition-shadow">
    <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} opacity-[0.03] rounded-full group-hover:scale-110 transition-transform duration-500`} />
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        {badge && (
          <span className={`mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${badgeCls}`}>
            {badge}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-slate-200`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
      </div>
    </div>
  </Link>
);

export default Dashboard;
