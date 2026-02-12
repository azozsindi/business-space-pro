import React, { useState, useEffect } from 'react';
import { User, UserRole, Space } from '../types';
import { 
  Users, UserPlus, ShieldCheck, UserCog, UserCheck, 
  Trash2, Mail, Lock, Building2, ChevronDown 
} from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  isSuperAdmin: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, isSuperAdmin }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bs_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [spaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem('bs_spaces');
    return saved ? JSON.parse(saved) : [];
  });

  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    role: 'employee' as UserRole,
    spaceId: 'master_space',
    password: ''
  });

  // حفظ المستخدمين عند أي تعديل
  useEffect(() => {
    localStorage.setItem('bs_users', JSON.stringify(users));
  }, [users]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const userToAdd: User = {
      id: Date.now().toString(),
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      spaceId: newUser.spaceId,
      permissions: {
        canManageUsers: newUser.role === 'super-admin' || newUser.role === 'admin',
        canCreateSpaces: newUser.role === 'super-admin',
        canViewAllReports: newUser.role !== 'employee'
      }
    };

    setUsers([...users, userToAdd]);
    setNewUser({ username: '', fullName: '', role: 'employee', spaceId: 'master_space', password: '' });
  };

  const deleteUser = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      'super-admin': 'bg-rose-100 text-rose-600 border-rose-200',
      'admin': 'bg-amber-100 text-amber-600 border-amber-200',
      'manager': 'bg-indigo-100 text-indigo-600 border-indigo-200',
      'employee': 'bg-emerald-100 text-emerald-600 border-emerald-200'
    };
    const labels = {
      'super-admin': 'سوبر أدمن',
      'admin': 'أدمن',
      'manager': 'منجر',
      'employee': 'موظف'
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${styles[role]}`}>{labels[role]}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-right" dir="rtl">
      {/* قسم إضافة مستخدم جديد */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex items-center gap-4 mb-8 flex-row-reverse">
          <div className="w-12 h-12 bg-indigo-50 text-primary rounded-2xl flex items-center justify-center">
            <UserPlus size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-800">إضافة عضو جديد للفريق</h3>
        </div>

        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 mr-2">الاسم الكامل</label>
            <input 
              required
              type="text" 
              value={newUser.fullName}
              onChange={e => setNewUser({...newUser, fullName: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
              placeholder="مثال: أحمد محمد"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 mr-2">اسم المستخدم (Login)</label>
            <input 
              required
              type="text" 
              value={newUser.username}
              onChange={e => setNewUser({...newUser, username: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
              placeholder="ahmed_2024"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 mr-2">الرتبة الوظيفية</label>
            <select 
              value={newUser.role}
              onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="employee">موظف (Employee)</option>
              <option value="manager">مدير مساحة (Manager)</option>
              {isSuperAdmin && <option value="admin">أدمن للنظام (Admin)</option>}
              {isSuperAdmin && <option value="super-admin">سوبر أدمن (Super Admin)</option>}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 mr-2">مساحة العمل</label>
            <select 
              value={newUser.spaceId}
              onChange={e => setNewUser({...newUser, spaceId: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="master_space">المساحة الرئيسية</option>
              {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <button type="submit" className="lg:col-span-4 bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all">
            تأكيد وإضافة المستخدم للنظام
          </button>
        </form>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center flex-row-reverse">
          <h3 className="font-black text-slate-800">إدارة أعضاء النظام الحاليين</h3>
          <span className="bg-white px-4 py-1 rounded-full border text-[10px] font-bold text-slate-400">إجمالي المستخدمين: {users.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6">المستخدم</th>
                <th className="px-8 py-6">الرتبة</th>
                <th className="px-8 py-6">مساحة العمل</th>
                <th className="px-8 py-6">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{u.fullName}</p>
                        <p className="text-xs text-slate-400 font-bold">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">{getRoleBadge(u.role)}</td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2 justify-end">
                      {spaces.find(s => s.id === u.spaceId)?.name || 'المساحة الرئيسية'}
                      <Building2 size={14} className="text-slate-300" />
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => deleteUser(u.id)}
                      className="p-3 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
