
import React from 'react';
import { Alert } from '../types';

interface AlertsProps {
  alerts: Alert[];
}

const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Alert Center</h3>
          <p className="text-slate-500">Monitor critical environmental incidents and sensor health</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Clear All</button>
           <button className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">Configure Alerts</button>
        </div>
      </div>

      <div className="grid gap-4">
        {alerts.map(alert => (
          <div key={alert.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              alert.severity === 'CRITICAL' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'
            }`}>
              {alert.severity === 'CRITICAL' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-bold text-slate-900">{alert.location}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {alert.severity}
                </span>
              </div>
              <p className="text-slate-600 text-sm">{alert.message}</p>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">
                Detected by {alert.sensorType.replace('_', ' ')} sensor at {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Acknowledge">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              </button>
              <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Delete">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        ))}
        {alerts.length === 0 && (
          <div className="bg-white rounded-2xl p-20 border border-slate-200 border-dashed text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 className="text-xl font-bold text-slate-800">All Clear!</h4>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">No environmental hazards or system issues detected at this moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
