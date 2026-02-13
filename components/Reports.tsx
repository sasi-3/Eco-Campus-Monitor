
import React, { useState } from 'react';
import { Reading } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface ReportsProps {
  readings: Reading[];
}

const Reports: React.FC<ReportsProps> = ({ readings }) => {
  const [reportType, setReportType] = useState('Daily');

  // Aggregated data for the report chart
  const reportData = [
    { name: 'Mon', temp: 22, aqi: 40, noise: 55 },
    { name: 'Tue', temp: 24, aqi: 45, noise: 60 },
    { name: 'Wed', temp: 21, aqi: 35, noise: 58 },
    { name: 'Thu', temp: 25, aqi: 50, noise: 65 },
    { name: 'Fri', temp: 23, aqi: 42, noise: 62 },
    { name: 'Sat', temp: 20, aqi: 30, noise: 45 },
    { name: 'Sun', temp: 19, aqi: 25, noise: 40 },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Environmental Report</h3>
            <p className="text-slate-500">Aggregate view of campus health metrics</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-sm rounded-xl px-4 py-2"
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            <button className="bg-sky-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-sky-600 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Average Temperature</h4>
            <p className="text-3xl font-bold text-slate-900">22.4°C</p>
            <span className="text-xs text-emerald-600 font-medium">Within normal range</span>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Average AQI</h4>
            <p className="text-3xl font-bold text-slate-900">38.2</p>
            <span className="text-xs text-emerald-600 font-medium">Optimal air quality</span>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Peak Noise</h4>
            <p className="text-3xl font-bold text-slate-900">88 dB</p>
            <span className="text-xs text-rose-600 font-medium">Threshold exceeded</span>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="temp" name="Temperature (°C)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aqi" name="Air Quality (AQI)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="noise" name="Noise (dB)" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;
