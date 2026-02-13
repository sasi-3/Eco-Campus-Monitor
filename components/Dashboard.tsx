
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar 
} from 'recharts';
import { Reading, Sensor, Alert } from '../types';
import { ICONS, COLORS } from '../constants';
import { getEnvironmentalInsights } from '../services/geminiService';

interface DashboardProps {
  readings: Reading[];
  sensors: Sensor[];
  alerts: Alert[];
}

const Dashboard: React.FC<DashboardProps> = ({ readings, sensors, alerts }) => {
  const [aiInsights, setAiInsights] = useState<string>('Analyzing campus environment...');
  const [isAiLoading, setIsAiLoading] = useState(true);

  useEffect(() => {
    if (readings.length > 5) {
      const fetchInsights = async () => {
        setIsAiLoading(true);
        const insights = await getEnvironmentalInsights(readings);
        setAiInsights(insights);
        setIsAiLoading(false);
      };
      fetchInsights();
    }
  }, [readings.length]);

  const latest = readings[readings.length - 1] || { temperature: 0, humidity: 0, aqi: 0, noise: 0 };

  return (
    <div className="space-y-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Temperature" 
          value={`${latest.temperature.toFixed(1)}°C`} 
          trend="+1.2%" 
          color="bg-orange-500" 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />}
        />
        <StatCard 
          label="Humidity" 
          value={`${latest.humidity.toFixed(0)}%`} 
          trend="-2.4%" 
          color="bg-sky-500" 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
        />
        <StatCard 
          label="Air Quality (AQI)" 
          value={latest.aqi.toFixed(0)} 
          status={latest.aqi > 50 ? (latest.aqi > 100 ? 'Poor' : 'Moderate') : 'Good'} 
          color="bg-emerald-500" 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />}
        />
        <StatCard 
          label="Noise Level" 
          value={`${latest.noise.toFixed(0)} dB`} 
          trend="+5.1%" 
          color="bg-violet-500" 
          icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Environmental Trends</h3>
              <p className="text-sm text-slate-500">Real-time tracking of various metrics across campus</p>
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
                    <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  tick={{fontSize: 12, fill: '#94a3b8'}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="temperature" stroke={COLORS.warning} strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                <Area type="monotone" dataKey="aqi" stroke={COLORS.success} strokeWidth={3} fillOpacity={1} fill="url(#colorAQI)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-sky-500/20 rounded-xl flex items-center justify-center text-sky-400">
              <ICONS.Brain />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Campus Insights</h3>
              <p className="text-xs text-slate-400">Powered by Gemini AI</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 prose prose-invert prose-sm max-w-none">
            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Gemini is crunching the numbers...</p>
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: aiInsights.replace(/\n/g, '<br/>') }} />
            )}
          </div>
          
          <button className="mt-6 w-full py-3 bg-sky-500 hover:bg-sky-600 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            Generate Detailed Report
          </button>
        </div>
      </div>

      {/* Recent Alerts & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Alerts</h3>
          <div className="space-y-4">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className={`w-2 rounded-full ${alert.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-slate-800">{alert.location}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{alert.message}</p>
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
          <div className="grid grid-cols-2 gap-4">
            {sensors.map(sensor => (
              <div key={sensor.id} className="p-4 border border-slate-100 rounded-xl flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${sensor.status === 'ACTIVE' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{sensor.location}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">{sensor.type.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string | number, trend?: string, status?: string, color: string, icon: React.ReactNode }> = ({ label, value, trend, status, color, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden group">
    <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} opacity-[0.03] rounded-full group-hover:scale-110 transition-transform duration-500`}></div>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {trend}
            </span>
          )}
          {status && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status === 'Good' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {status}
            </span>
          )}
        </div>
      </div>
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-slate-200`}>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
      </div>
    </div>
  </div>
);

export default Dashboard;
