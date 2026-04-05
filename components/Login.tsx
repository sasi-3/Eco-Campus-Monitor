
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { API_CONFIG } from '@/config';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Mock Authentication to bypass server connection issues
      if (password === 'demo123') {
        let role = UserRole.STUDENT;
        let name = 'Student User';
        
        if (email === 'admin@edu.in') {
          role = UserRole.ADMIN;
          name = 'Admin User';
        } else if (email === 'faculty@edu.in') {
          role = UserRole.FACULTY;
          name = 'Faculty User';
        } else if (email !== 'student@edu.in') {
           // Allow any email with demo123 as a default user
           name = 'Guest User';
        }
        
        const mockUser: User = {
          id: 'mock-' + Date.now(),
          name,
          email,
          role
        };
        
        onLogin(mockUser);
      } else {
        setError('Invalid credentials. Password should be demo123');
      }
    } catch (err) {
      setError('An unexpected error occurred during login');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30 border border-white/10">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">EcoCampus</h1>
          <p className="text-indigo-200 mt-2 font-medium">Environmental Monitoring Platform</p>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          
          <div className="mb-8">
            <p className="text-sm font-semibold text-slate-500 mb-3 text-center uppercase tracking-wider">Demo Access Roles</p>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
              <button 
                type="button"
                onClick={() => { setEmail('student@edu.in'); setPassword('demo123'); }}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${email === 'student@edu.in' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Student
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('faculty@edu.in'); setPassword('demo123'); }}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${email === 'faculty@edu.in' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Faculty
              </button>
              <button 
                type="button"
                onClick={() => { setEmail('admin@edu.in'); setPassword('demo123'); }}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${email === 'admin@edu.in' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Campus Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white/50"
                placeholder="you@university.edu"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white/50"
                placeholder="••••••••"
              />
              {error && <p className="text-red-500 text-sm mt-2 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 border border-indigo-500/20"
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

        <p className="text-center text-indigo-200/80 text-sm mt-8">
          Need help? <a href="#" className="font-semibold text-white hover:text-indigo-200 transition-colors">Contact System Admin</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
