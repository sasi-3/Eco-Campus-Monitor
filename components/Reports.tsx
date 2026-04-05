
import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Reading } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ReportsProps {
  readings: Reading[];
}

const Reports: React.FC<ReportsProps> = ({ readings }) => {
  const [reportType, setReportType] = useState('Daily');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!reportRef.current) return;
    toast.loading('Generating PDF...', { id: 'pdf-export' });
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`eco-campus-report-${reportType.toLowerCase()}.pdf`);
      toast.success('PDF downloaded successfully', { id: 'pdf-export' });
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('Failed to create PDF', { id: 'pdf-export' });
    }
  };

  const dataMap: Record<string, { label: string; stats: any; chart: any[] }> = {
    'Daily': {
      label: 'Average Temperature',
      stats: { temp: '22.4°C', aqi: '38.2', noise: '88 dB', tempStatus: 'Within normal range', tempCls: 'text-emerald-600', noiseStatus: 'Threshold exceeded', noiseCls: 'text-rose-600' },
      chart: [
        { name: '08:00', temp: 20, aqi: 30, noise: 50 },
        { name: '10:00', temp: 22, aqi: 45, noise: 65 },
        { name: '12:00', temp: 24, aqi: 60, noise: 88 },
        { name: '14:00', temp: 25, aqi: 50, noise: 75 },
        { name: '16:00', temp: 23, aqi: 42, noise: 70 },
        { name: '18:00', temp: 21, aqi: 35, noise: 55 },
      ]
    },
    'Weekly': {
      label: 'Average Temperature',
      stats: { temp: '23.1°C', aqi: '42.5', noise: '75 dB', tempStatus: 'Slightly elevated', tempCls: 'text-amber-600', noiseStatus: 'Normal levels', noiseCls: 'text-emerald-600' },
      chart: [
        { name: 'Mon', temp: 22, aqi: 40, noise: 55 },
        { name: 'Tue', temp: 24, aqi: 45, noise: 60 },
        { name: 'Wed', temp: 21, aqi: 35, noise: 58 },
        { name: 'Thu', temp: 25, aqi: 50, noise: 65 },
        { name: 'Fri', temp: 23, aqi: 42, noise: 62 },
        { name: 'Sat', temp: 20, aqi: 30, noise: 45 },
        { name: 'Sun', temp: 19, aqi: 25, noise: 40 },
      ]
    },
    'Monthly': {
      label: 'Average Temperature',
      stats: { temp: '20.5°C', aqi: '35.0', noise: '68 dB', tempStatus: 'Optimal', tempCls: 'text-emerald-600', noiseStatus: 'Normal levels', noiseCls: 'text-emerald-600' },
      chart: [
        { name: 'Week 1', temp: 21, aqi: 32, noise: 65 },
        { name: 'Week 2', temp: 22, aqi: 38, noise: 70 },
        { name: 'Week 3', temp: 19, aqi: 30, noise: 60 },
        { name: 'Week 4', temp: 20, aqi: 40, noise: 75 },
      ]
    }
  };

  const currentView = dataMap[reportType] || dataMap['Weekly'];
  const reportData = currentView.chart;

  return (
    <div className="space-y-8">
      <div ref={reportRef} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Environmental Report</h3>
            <p className="text-slate-500">Aggregate view of campus health metrics ({reportType})</p>
          </div>
          <div className="flex gap-3">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl px-4 py-2 cursor-pointer outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
            <button 
              onClick={handleExport}
              className="bg-sky-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-sky-600 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">{currentView.label}</h4>
            <p className="text-3xl font-bold text-slate-900">{currentView.stats.temp}</p>
            <span className={`text-xs font-medium ${currentView.stats.tempCls}`}>{currentView.stats.tempStatus}</span>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Average AQI</h4>
            <p className="text-3xl font-bold text-slate-900">{currentView.stats.aqi}</p>
            <span className="text-xs text-emerald-600 font-medium">Optimal air quality</span>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Peak Noise</h4>
            <p className="text-3xl font-bold text-slate-900">{currentView.stats.noise}</p>
            <span className={`text-xs font-medium ${currentView.stats.noiseCls}`}>{currentView.stats.noiseStatus}</span>
          </div>
        </div>

        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36} />
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
