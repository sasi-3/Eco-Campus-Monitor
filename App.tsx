
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User, UserRole, Sensor, Reading, Alert } from './types';
import { ICONS, COLORS } from './constants';
import Dashboard from './components/Dashboard';
import Sensors from './components/Sensors';
import Reports from './components/Reports';
import Alerts from './components/Alerts';
import Users from './components/Users';
import Login from './components/Login';

// Mock Initial Data
const INITIAL_SENSORS: Sensor[] = [
  { id: 'S1', location: 'Main Library', type: 'TEMPERATURE', status: 'ACTIVE', lastReading: 22.5, unit: '°C' },
  { id: 'S2', location: 'Main Library', type: 'AIR_QUALITY', status: 'ACTIVE', lastReading: 45, unit: 'AQI' },
  { id: 'S3', location: 'Science Block A', type: 'HUMIDITY', status: 'ACTIVE', lastReading: 60, unit: '%' },
  { id: 'S4', location: 'Student Union', type: 'NOISE', status: 'WARNING', lastReading: 85, unit: 'dB' },
  { id: 'S5', location: 'Cafeteria', type: 'AIR_QUALITY', status: 'ACTIVE', lastReading: 32, unit: 'AQI' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>(INITIAL_SENSORS);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Generate mock real-time readings
  const generateReading = useCallback(() => {
    const locations = ['Main Library', 'Science Block A', 'Student Union', 'Cafeteria'];
    const newReading: Reading = {
      timestamp: new Date().toISOString(),
      temperature: 20 + Math.random() * 10,
      humidity: 40 + Math.random() * 30,
      aqi: 20 + Math.random() * 80,
      noise: 40 + Math.random() * 50,
      location: locations[Math.floor(Math.random() * locations.length)],
    };
    
    setReadings(prev => [...prev.slice(-49), newReading]);

    // Simple alert logic
    if (newReading.aqi > 90) {
      setAlerts(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        severity: 'WARNING',
        message: `High pollution levels detected in ${newReading.location}`,
        location: newReading.location,
        sensorType: 'AIR_QUALITY'
      }, ...prev.slice(0, 19)]);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(generateReading, 5000);
    // Initial batch of readings
    for(let i=0; i<20; i++) generateReading();
    return () => clearInterval(interval);
  }, [generateReading]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
               <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">EcoCampus</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <SidebarLink to="/" icon={<ICONS.Dashboard />} label="Dashboard" />
            <SidebarLink to="/sensors" icon={<ICONS.Sensors />} label="Sensors" />
            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.FACULTY) && (
              <SidebarLink to="/reports" icon={<ICONS.Reports />} label="Reports" />
            )}
            <SidebarLink to="/alerts" icon={<ICONS.Alerts />} label="Alerts" badge={alerts.length > 0 ? alerts.length : undefined} />
            {currentUser.role === UserRole.ADMIN && (
              <SidebarLink to="/users" icon={<ICONS.Users />} label="Users" />
            )}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sky-400">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate capitalize">{currentUser.role.toLowerCase()}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ICONS.Logout />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">
               Campus Environmental Monitoring
            </h2>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                 System Online
               </div>
            </div>
          </header>

          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard readings={readings} sensors={sensors} alerts={alerts} />} />
              <Route path="/sensors" element={<Sensors sensors={sensors} setSensors={setSensors} role={currentUser.role} />} />
              <Route path="/reports" element={<Reports readings={readings} />} />
              <Route path="/alerts" element={<Alerts alerts={alerts} />} />
              <Route path="/users" element={currentUser.role === UserRole.ADMIN ? <Users /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, badge }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center justify-between p-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-sky-500/10 text-sky-500 font-semibold' 
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge && (
        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default App;
