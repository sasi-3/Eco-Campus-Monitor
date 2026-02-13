
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: Math.random().toString(),
      name: email.split('@')[0] || 'User',
      email: email || 'user@campus.edu',
      role: role
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sky-500/20">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">EcoCampus</h1>
          <p className="text-slate-400 mt-2">Environmental Monitoring Platform</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Campus Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                placeholder="you@university.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select Access Role</label>
              <div className="grid grid-cols-3 gap-3">
                {[UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                      role === r 
                        ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20' 
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xl transition-all active:scale-95"
            >
              Secure Login
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
             <span className="flex items-center gap-1">
               <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.9L10 1.55l7.834 3.35a1 1 0 01.666.939V10c0 5.185-3.047 9.176-7.834 10.95a1 1 0 01-.666 0C5.047 19.176 2 15.185 2 10V5.839a1 1 0 01.666-.938z" clipRule="evenodd" /></svg>
               SSL Secured
             </span>
             <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-sm mt-8">
          Need help? <a href="#" className="text-sky-400 font-semibold hover:text-sky-300">Contact System Admin</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
