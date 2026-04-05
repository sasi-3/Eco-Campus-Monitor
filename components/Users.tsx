import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { UserRole } from '../types';
import { API_CONFIG } from '@/config';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActive: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);

  const fetchUsers = async () => {
    try {
      const res = await fetch(API_CONFIG.ENDPOINTS.USERS);
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setModalMode('add');
    setName('');
    setEmail('');
    setPassword('');
    setRole(UserRole.STUDENT);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setModalMode('edit');
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // leave blank unless resetting
    setRole(user.role);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (modalMode === 'add') {
        res = await fetch(API_CONFIG.ENDPOINTS.USERS, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
      } else {
        res = await fetch(`${API_CONFIG.ENDPOINTS.USERS}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
      }
      
      const data = await res.json();
      
      if (data.success) {
        setIsModalOpen(false);
        fetchUsers();
        toast.success(`User successfully ${modalMode === 'add' ? 'created' : 'updated'}`);
      } else {
        toast.error(data.message || 'Failed to save user');
      }
    } catch (e) {
      console.error(e);
      toast.error('A network error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!confirm('Are you sure you want to remove this user?')) return;
      
      const res = await fetch(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchUsers();
        toast.success("User removed successfully");
      } else {
        toast.error("Failed to remove user");
      }
    } catch (e) {
      console.error(e);
      toast.error("A network error occurred");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-slate-800">User Management</h3>
          <p className="text-sm text-slate-500">Configure access credentials for Faculty and Students</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold hover:bg-slate-800 transition-colors text-sm shadow-md active:scale-95"
        >
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
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center font-bold text-sky-600">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-900">{user.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${user.role === UserRole.ADMIN ? 'bg-violet-100 text-violet-700' :
                      user.role === UserRole.FACULTY ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">{user.email}</td>
                <td className="px-6 py-4 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Provisioned
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="text-sky-600 hover:text-sky-800 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    {user.role !== UserRole.ADMIN && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-10 text-slate-500">No users found.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              {modalMode === 'add' ? 'Configure New User' : 'Edit User Credentials'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">Assign login credentials strictly to campus members.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Display Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="e.g. Dr. Adam"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Campus Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="name@edu.in"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {modalMode === 'add' ? 'Assign Password' : 'Change Password (leave blank to keep)'}
                </label>
                <input
                  type="text"
                  required={modalMode === 'add'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Access Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none bg-white"
                >
                  <option value={UserRole.STUDENT}>STUDENT</option>
                  <option value={UserRole.FACULTY}>FACULTY</option>
                  <option value={UserRole.ADMIN}>ADMIN (Careful)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
                >
                  {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
