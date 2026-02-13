
import React, { useState } from 'react';
import { Sensor, UserRole } from '../types';

interface SensorsProps {
  sensors: Sensor[];
  setSensors: React.Dispatch<React.SetStateAction<Sensor[]>>;
  role: UserRole;
}

const Sensors: React.FC<SensorsProps> = ({ sensors, setSensors, role }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdmin = role === UserRole.ADMIN;

  const toggleStatus = (id: string) => {
    if (!isAdmin) return;
    setSensors(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : s
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Campus Sensor Network</h3>
          <p className="text-sm text-slate-500">Manage and monitor all IoT deployment points</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Deploy New Sensor
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Sensor ID</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Current Reading</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {sensors.map(sensor => (
              <tr key={sensor.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono text-slate-500">{sensor.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{sensor.location}</td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-full text-slate-600 font-medium lowercase first-letter:uppercase">
                    {sensor.type.replace('_', ' ').toLowerCase()}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700">
                  {sensor.lastReading} {sensor.unit}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sensor.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                    sensor.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {sensor.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleStatus(sensor.id)}
                      disabled={!isAdmin}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md ${
                        isAdmin ? 'bg-sky-50 text-sky-600 hover:bg-sky-100' : 'bg-slate-50 text-slate-300'
                      }`}
                    >
                      {sensor.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                    </button>
                    {isAdmin && (
                      <button className="text-slate-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sensors;
