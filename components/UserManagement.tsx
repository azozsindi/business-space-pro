import React, { useState, useEffect } from 'react';
import { User, UserRole, Space } from '../types';
import { 
  Users, UserPlus, ShieldCheck, UserCog, UserCheck, 
  Trash2, Building2, AlertCircle, ShieldAlert, UserX
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

  // --- منطق الفلترة الذكي ---
  // المنجر يرى فقط مستخدمي مساحته، السوبر أدمن يرى الجميع
  const visibleUsers = isSuperAdmin 
    ? users 
    : users.filter(u => u.spaceId === currentUser.spaceId && u.role !== 'super-admin');

  // حساب السعة الحالية للمساحة
  const currentSpace = spaces.find(s => s.id === (isSuperAdmin ? 'master_space' : currentUser.spaceId));
  const spaceUserCount = users.filter(u => u.spaceId === (isSuperAdmin ? 'master_space' : currentUser.spaceId)).length;
  const limit = isSuperAdmin ? Infinity : (currentSpace?.userLimit || 0);

  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    role: 'employee' as UserRole,
    spaceId: isSuperAdmin ? 'master_space' : (currentUser.spaceId || 'master_space'),
    password: ''
  });

  useEffect(() => {
    localStorage.setItem('bs_users', JSON.stringify(users));
  }, [users]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صلاحية العدد (فقط للمنجر، السوبر أدمن مفتوح)
    if (!isSuperAdmin && spaceUserCount >= limit) {
      alert(`⚠️ خطأ: لقد وصلت للحد الأقصى المسموح به في مساحتك (${limit} مستخدمين). يرجى طلب زيادة السعة من السوبر أدمن.`);
      return;
    }

    const userToAdd: User = {
      id: Date.now().toString(),
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      spaceId: newUser.spaceId,
      permissions: {
        canManageUsers: newUser.role === 'manager' || newUser.role === 'admin' || newUser.role === 'super-admin',
        canCreateSpaces: newUser.role === 'super-admin',
        canViewAllReports: newUser.role !== 'employee'
      }
    };

    setUsers([...users, userToAdd]);
    setNewUser({ ...newUser, username: '', fullName: '', password: '' });
  };

  const deleteUser = (id: string) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === 'super-admin' && !isSuperAdmin) {
      alert('لا تملك صلاحية حذف السوبر أدمن!');
      return;
    }
    
    if (confirm('هل أنت متأكد من حذف هذا العضو؟ سيتم سحب كافة صلاحياته فوراً.')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      'super-admin': 'bg-rose-50 text-rose-600 border-rose-100',
      'admin': 'bg-amber-50 text-amber-600 border-amber-100',
      'manager': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'employee': 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };
    return <span className={`px-3 py-1 rounded-xl text-[10px] font-black border ${styles[role]}`}>{role.toUpperCase()}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-right" dir="rtl">
      
      {/* هيدر معلومات السعة */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black dark:text-white">إدارة فريق العمل</h3>
            <p className="text-sm font-bold text-slate-400">
              {isSuperAdmin ? 'تحكم كامل في كافة مساحات النظام' : `إدارة أعضاء مساحة: ${currentSpace?.name || 'الرئيسية'}`}
            </p>
          </div>
        </div>
        
        {!isSuperAdmin && (
          <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-1">السعة المستخدمة</p>
              <p className={`text-xl font-black ${spaceUserCount >= limit ? 'text-rose-500' : 'text-primary'}`}>{spaceUserCount} / {limit}</p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
            <ShieldAlert size={24} className={spaceUserCount >= limit ? 'text-rose-500' : 'text-slate-300'} />
          </div>
        )}
      </div>

      {/* نموذج الإضافة المطور */}
      <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
        <h4 className="text-lg font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 flex-row-reverse">
          <UserPlus size={20} className="text-primary" /> إضافة عضو جديد للقسم
        </h4>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <input 
            required
            type="text" 
            placeholder="الاسم الكامل"
            value={newUser.fullName}
            onChange={e => setNewUser({...newUser, fullName: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary"
          />
          <input 
            required
            type="text" 
            placeholder="اسم المستخدم"
            value={newUser.username}
            onChange={e => setNewUser({...newUser, username: e.target.value})}
            className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary"
          />
          
          <select 
            value={newUser.role}
            onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
            className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none cursor-pointer"
          >
            <option value="employee">موظف (Employee)</option>
            {isSuperAdmin && <option value="manager">مدير مساحة (Manager)</option>}
            {isSuperAdmin && <option value="admin">أدمن (Admin)</option>}
          </select>

          {isSuperAdmin && (
            <select 
              value={newUser.spaceId}
              onChange={e => setNewUser({...newUser, spaceId: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none cursor-pointer"
            >
              <option value="master_space">المساحة الرئيسية</option>
              {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}

          <button type="submit" className="lg:col-span-4 bg-primary text-white py-4 rounded-2xl font-black shadow-lg hover:scale-[1.01] active:scale-95 transition-all">
            تأكيد التعيين في النظام
          </button>
        </form>
      </div>

      {/* الجدول المطور */}
      <div className="bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6 text-right">الموظف</th>
                <th className="px-8 py-6 text-right">الدور الوظيفي</th>
                {isSuperAdmin && <th className="px-8 py-6 text-right">المساحة التابع لها</th>}
                <th className="px-8 py-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {visibleUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 flex-row-reverse">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-500 font-black">
                        {u.fullName.substring(0, 1)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{u.fullName}</p>
                        <p className="text-xs text-slate-400 font-bold">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">{getRoleBadge(u.role)}</td>
                  {isSuperAdmin && (
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 justify-end text-xs font-bold text-slate-500">
                        {spaces.find(s => s.id === u.spaceId)?.name || 'المساحة الرئيسية'}
                        <Building2 size={14} />
                      </div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => deleteUser(u.id)}
                        className="p-3 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-all"
                        title="حذف المستخدم"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleUsers.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <UserX size={48} className="text-slate-200" />
              <p className="text-slate-400 font-bold italic">لا يوجد أعضاء مضافين حالياً في هذا النطاق</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
