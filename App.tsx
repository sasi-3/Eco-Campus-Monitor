import React, { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { User, UserRole, Sensor, Reading, Alert, getSensorExpiry } from "./types";
import { ICONS } from "./constants";
import { API_CONFIG } from "./config";

// Lazy-loaded route components
const Dashboard = lazy(() => import("./components/Dashboard"));
const Sensors = lazy(() => import("./components/Sensors"));
const Reports = lazy(() => import("./components/Reports"));
const Alerts = lazy(() => import("./components/Alerts"));
const Users = lazy(() => import("./components/Users"));
const Login = lazy(() => import("./components/Login"));



import { Toaster, toast } from 'react-hot-toast';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetch(API_CONFIG.ENDPOINTS.SENSORS)
      .then(res => res.json())
      .then(data => setSensors(data))
      .catch(err => {
        console.error("Could not fetch sensors, using mock data", err);
        setSensors([
          { id: 'S1', location: 'Main Library', type: 'TEMPERATURE', status: 'LOW', lastReading: 22, unit: '°C', installDate: '2025-01-01', expiryDate: '2026-05-01', utilizationRate: 85, isActive: true },
          { id: 'S2', location: 'Gymnasium', type: 'HUMIDITY', status: 'MEDIUM', lastReading: 55, unit: '%', installDate: '2025-02-01', expiryDate: '2030-01-01', utilizationRate: 40, isActive: true },
          { id: 'S3', location: 'Cafeteria', type: 'AIR_QUALITY', status: 'HIGH', lastReading: 120, unit: 'AQI', installDate: '2025-03-01', expiryDate: '2025-12-01', utilizationRate: 95, isActive: true },
          { id: 'S4', location: 'Lecture Hall A', type: 'NOISE', status: 'LOW', lastReading: 45, unit: 'dB', installDate: '2025-04-10', expiryDate: '2026-04-10', utilizationRate: 70, isActive: true },
          { id: 'S5', location: 'Science Block', type: 'TEMPERATURE', status: 'LOW', lastReading: 24, unit: '°C', installDate: '2024-01-15', expiryDate: '2025-01-01', utilizationRate: 90, isActive: true } // EXPIRED SIMULATION
        ]);
      });
  }, []);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const generateReading = useCallback(async () => {
    try {
      let data;
      try {
        const response = await fetch(`${API_CONFIG.ENDPOINTS.READINGS}/latest`);
        data = await response.json();
      } catch (err) {
        data = [
          { timestamp: new Date().toISOString(), temperature: 18 + Math.random() * 14, humidity: 30 + Math.random() * 45, aqi: 20 + Math.random() * 80, noise: 40 + Math.random() * 45, location: 'Main Library' },
          { timestamp: new Date().toISOString(), temperature: 20 + Math.random() * 12, humidity: 40 + Math.random() * 40, aqi: 30 + Math.random() * 70, noise: 45 + Math.random() * 35, location: 'Gymnasium' },
          { timestamp: new Date().toISOString(), temperature: 21 + Math.random() * 10, humidity: 35 + Math.random() * 50, aqi: 40 + Math.random() * 90, noise: 50 + Math.random() * 40, location: 'Cafeteria' },
          { timestamp: new Date().toISOString(), temperature: 19 + Math.random() * 11, humidity: 45 + Math.random() * 30, aqi: 25 + Math.random() * 60, noise: 35 + Math.random() * 30, location: 'Lecture Hall A' }
        ];
      }

      if (!data || data.length === 0) return;

      const newReading: Reading = data[Math.floor(Math.random() * data.length)];

      setReadings(prev => [...prev.slice(-49), newReading]);

      const newAlerts: Alert[] = [];

      if (newReading.aqi > 90) {
        newAlerts.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          severity: "WARNING",
          message: `High pollution detected in ${newReading.location} — AQI ${newReading.aqi.toFixed(0)}. Increase ventilation immediately.`,
          location: newReading.location,
          sensorType: "AIR_QUALITY",
        });
      }

      if (newReading.temperature > 28) {
        newAlerts.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          severity: "WARNING",
          message: `Heat stress alert in ${newReading.location} — ${newReading.temperature.toFixed(1)}°C exceeds comfort threshold.`,
          location: newReading.location,
          sensorType: "TEMPERATURE",
        });
      }

      if (newReading.humidity > 70) {
        newAlerts.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          severity: "INFO",
          message: `High humidity in ${newReading.location} — ${newReading.humidity.toFixed(0)}%, mould risk. Check ventilation.`,
          location: newReading.location,
          sensorType: "HUMIDITY",
        });
      }

      // Dynamic sensor status & reading updates based on the current live reading
      setSensors(prevSensors => {
        const resolvedAlerts: Alert[] = [];
        
        const updatedSensors = prevSensors.map(sensor => {
          // Auto-resolve simulation: If a sensor is HIGH, there is a 15% chance it gets automatically fixed by the system
          if (sensor.status === 'HIGH' && Math.random() < 0.15) {
             toast.success(`Automated System: ${sensor.type.replace('_', ' ')} issue at ${sensor.location} has been resolved.`);
             resolvedAlerts.push({
               id: Math.random().toString(36).substring(2, 9),
               timestamp: new Date().toISOString(),
               severity: "INFO",
               message: `Automated Resolution: ${sensor.type.replace('_', ' ')} levels at ${sensor.location} have returned to normal operating capacity.`,
               location: sensor.location,
               sensorType: sensor.type,
             });
             return { ...sensor, status: 'LOW' as "HIGH"|"MEDIUM"|"LOW", lastReading: sensor.type === 'TEMPERATURE' ? 22 : sensor.type === 'HUMIDITY' ? 45 : sensor.type === 'AIR_QUALITY' ? 30 : 40 };
          }
          
          if (sensor.location === newReading.location && sensor.status !== 'HIGH') {
            let newValue = sensor.lastReading;
            let newStatus = sensor.status;
            
            if (sensor.type === 'TEMPERATURE') {
              newValue = newReading.temperature;
              newStatus = newValue > 28 ? 'HIGH' : newValue > 24 ? 'MEDIUM' : 'LOW';
            } else if (sensor.type === 'HUMIDITY') {
              newValue = newReading.humidity;
              newStatus = newValue > 70 ? 'HIGH' : newValue > 45 ? 'MEDIUM' : 'LOW';
            } else if (sensor.type === 'AIR_QUALITY') {
              newValue = newReading.aqi;
              newStatus = newValue > 90 ? 'HIGH' : newValue > 50 ? 'MEDIUM' : 'LOW';
            } else if (sensor.type === 'NOISE') {
              newValue = newReading.noise;
              newStatus = newValue > 80 ? 'HIGH' : newValue > 60 ? 'MEDIUM' : 'LOW';
            }
            return { ...sensor, lastReading: newValue, status: newStatus as "HIGH"|"MEDIUM"|"LOW" };
          }
          return sensor;
        });
        
        if (resolvedAlerts.length > 0) {
          setAlerts(prev => [...resolvedAlerts, ...prev].slice(0, 30));
        }
        
        return updatedSensors;
      });

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 30));
      }
    } catch (error) {
      console.error("Backend fetch error:", error);
    }
  }, []);

  // Sensor expiry alerts (evaluate when sensors are loaded initially)
  useEffect(() => {
    if (sensors.length === 0) return;
    
    const newAlerts: Alert[] = [];
    sensors.forEach(sensor => {
      if (!sensor.expiryDate) return;
      const expiry = getSensorExpiry(sensor.expiryDate);
      if (expiry === "EXPIRED") {
        newAlerts.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          severity: "CRITICAL",
          message: `Sensor ${sensor.id} at ${sensor.location} has EXPIRED. Immediate replacement needed.`,
          location: sensor.location,
          sensorType: sensor.type,
        });
      } else if (expiry === "EXPIRING_SOON") {
        const daysLeft = Math.ceil(
          (new Date(sensor.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        newAlerts.push({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          severity: "WARNING",
          message: `Sensor ${sensor.id} at ${sensor.location} expires in ${daysLeft} day(s). Schedule replacement.`,
          location: sensor.location,
          sensorType: sensor.type,
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 30));
    }
  }, [sensors.length]);

  useEffect(() => {
    const interval = setInterval(generateReading, 5000);
    for (let i = 0; i < 10; i++) generateReading();
    return () => clearInterval(interval);
  }, [generateReading]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  if (!currentUser) {
    return (
      <div className="w-full h-screen">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <HashRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: '#1e293b', color: '#fff' } }} />
      <div className="flex h-screen overflow-hidden">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <aside className={`fixed inset-y-0 left-0 z-40 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-slate-900 text-white flex flex-col`}>
          <div className="p-6 border-b border-slate-800 font-bold text-xl">
            EcoCampus
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <SidebarLink to="/" icon={<ICONS.Dashboard />} label="Dashboard" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/sensors" icon={<ICONS.Sensors />} label="Sensors" onClick={() => setIsSidebarOpen(false)} />
            <SidebarLink to="/alerts" icon={<ICONS.Alerts />} label="Alerts" badge={alerts.length} onClick={() => setIsSidebarOpen(false)} />
            {currentUser.role === UserRole.ADMIN && (
              <SidebarLink to="/users" icon={<ICONS.Users />} label="Users" onClick={() => setIsSidebarOpen(false)} />
            )}
          </nav>

          <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
            <p className="font-semibold text-slate-300">{currentUser.name}</p>
            <p>{currentUser.role}</p>
          </div>

          <button
            onClick={handleLogout}
            className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </aside>

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
            <div className="font-bold text-xl text-slate-800">EcoCampus</div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-800 focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>

          <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
            <Suspense fallback={
              <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard readings={readings} sensors={sensors} alerts={alerts} />} />
                <Route path="/sensors" element={<Sensors sensors={sensors} setSensors={setSensors} role={currentUser.role} />} />
                <Route path="/reports" element={<Reports readings={readings} />} />
                <Route path="/alerts" element={<Alerts alerts={alerts} onClearAll={() => setAlerts([])} />} />
                <Route path="/users" element={<Users />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </HashRouter>
  );
};

const SidebarLink = ({ to, icon, label, badge, onClick }: any) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex justify-between p-3 rounded-lg transition-colors ${active ? "bg-sky-600 text-white" : "text-gray-400 hover:bg-slate-800"
        }`}
    >
      <span className="flex gap-2 items-center">{icon}{label}</span>
      {badge > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{badge}</span>}
    </Link>
  );
};

export default App;
