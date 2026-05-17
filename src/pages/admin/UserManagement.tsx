import React from 'react';
import AdminLayout from './AdminDashboard';
import { useAdmin } from '../../context/AdminContext';
import { Mail, Shield, User, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '../../components/Button';
import { motion } from 'motion/react';

export default function UserManagement() {
  const { users, updateUserRole, deleteUser, isLoading } = useAdmin();

  if (isLoading) return <AdminLayout><div>Loading users...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">User Management</h1>
          <p className="text-zinc-500">View and manage all registered platform users.</p>
        </div>

        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={user.id} 
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold border border-brand-primary/20">
                          {user.email?.[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.email}</p>
                          <p className="text-xs text-zinc-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' ? 'bg-purple-500/20 text-purple-500 border border-purple-500/20' : 'bg-blue-500/20 text-blue-500 border border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.role === 'user' ? (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"
                            onClick={() => updateUserRole(user.id, 'admin')}
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Make Admin
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20 border-zinc-500/20"
                            onClick={() => updateUserRole(user.id, 'user')}
                          >
                            <User className="w-4 h-4 mr-2" />
                            Make User
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:bg-red-500/10 ml-2"
                          onClick={() => confirm('Delete user? This action cannot be undone.') && deleteUser(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
