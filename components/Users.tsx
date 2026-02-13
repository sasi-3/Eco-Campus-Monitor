
import React from 'react';
import { UserRole } from '../types';

const Users: React.FC = () => {
  const users = [
    { id: '1', name: 'John Doe', role: UserRole.ADMIN, email: 'admin@campus.edu', lastActive: '2 hours ago' },
    { id: '2', name: 'Dr. Sarah Smith', role: UserRole.FACULTY, email: 'sarah.s@campus.edu', lastActive: 'Active now' },
    { id: '3', name: 'Student Monitor', role: UserRole.STUDENT, email: 'monitor.s@campus.edu', lastActive: '5 days ago' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">User Management</h3>
          <p className="text-sm text-slate-500">Assign roles and manage access permissions</p>
        </div>
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-800 transition-colors text-sm">
          Add User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Last Activity</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                     {user.name.charAt(0)}
                   </div>
                   <span className="font-semibold text-slate-900">{user.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    user.role === UserRole.ADMIN ? 'bg-violet-100 text-violet-700' :
                    user.role === UserRole.FACULTY ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-slate-400">{user.lastActive}</td>
                <td className="px-6 py-4">
                   <button className="text-slate-400 hover:text-slate-900 font-medium">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
