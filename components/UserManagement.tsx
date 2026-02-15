import React, { useState } from 'react';
import { User, UserRole, Space } from '../types';
import { 
  Users, UserPlus, ShieldCheck, UserCog, UserCheck, 
  Trash2, Building2, AlertCircle, ShieldAlert, UserX,
  Mail, UserMinus, Shield
} from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  isSuperAdmin: boolean;
  usersList: User[]; // تستقبل القائمة من App.tsx لضمان التزامن
  onUsersChange: () => void; // وظيفة لتنبيه App.tsx عند حدوث تغيير
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  currentUser, 
  isSuperAdmin, 
  usersList, 
  onUsersChange 
}) => {
  
  const [spaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem('bs_spaces');
    return saved ? JSON.parse(saved) : [];
  });

  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    role: 'employee' as UserRole,
    spaceId: isSuperAdmin ? 'master_space' : (currentUser.spaceId || 'master_space'),
    password: ''
  });

  // --- منطق الفلترة الذكي ---
  const visibleUsers = isSuperAdmin 
    ? usersList.filter(u => u.id !== currentUser.id) 
    : usersList.filter(u => u.spaceId === currentUser.spaceId && u.id !== currentUser.id);

  // حساب السعة للمساحة الحالية
  const currentSpace = spaces.find(s => s.id === (isSuperAdmin ? 'master_space' : currentUser.spaceId));
  const spaceUserCount = usersList.filter(u => u.spaceId === (isSuperAdmin ? 'master_space' : currentUser.spaceId)).length;
  const limit = isSuperAdmin ? Infinity : (currentSpace?.userLimit || 0);

  // إضافة مستخدم جديد
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin && spaceUserCount >= limit) {
      alert(`⚠️ خطأ: لقد وصلت للحد الأقصى المسموح به (${limit}).`);
      return;
    }

    const userToAdd: User = {
      id: Date.now().toString(),
      username: newUser.username,
      fullName: newUser.fullName,
      role: newUser.role,
      spaceId: newUser.spaceId,
      isActive: true, // يضاف مفعلاً تلقائياً
      permissions: {
        canManageUsers: ['manager', 'admin', 'super-admin'].includes(newUser.role),
        canCreateSpaces: newUser.role === 'super-admin',
        canViewAllReports: newUser.role !== 'employee'
      }
    };

    const updatedUsers = [...usersList, userToAdd];
    localStorage.setItem('bs_users_data', JSON.stringify(updatedUsers));
    onUsersChange(); // تحديث App.tsx
    setNewUser({ ...newUser, username: '', fullName: '', password: '' });
  };

  // تفعيل أو تعطيل حساب
  const toggleUserStatus = (userId: string) => {
    const updatedUsers = usersList.map(u => 
      u.id === userId ? { ...u, isActive: !u.isActive } : u
    );
    localStorage.setItem('bs_users_data', JSON.stringify(updatedUsers));
    onUsersChange();
  };

  // حذف مستخدم
  const deleteUser = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العضو نهائياً؟')) {
      const updatedUsers = usersList.filter(u => u.id !== id);
      localStorage.setItem('bs_users_data', JSON.stringify(updatedUsers));
      onUsersChange();
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      'super-admin': 'bg-rose-50 text-rose-600 border-rose-100',
      'admin': 'bg-amber-50 text-amber-600 border-amber-100',
      'manager': 'bg-indigo-50 text-indigo-600 border-indigo-100',
      'employee': 'bg-emerald-50 text-emerald-600 border-emerald-100'
    };
    return <span className={`px-3 py-1 rounded-xl text-[10px] font-black border uppercase ${styles[role]}`}>{role}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 text-right pb-20" dir="rtl">
      
      {/* هيدر معلومات السعة */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 flex-row-reverse">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center shadow-inner">
            <Users size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black dark:text-white">إدارة فريق العمل</h3>
            <p className="text-sm font-bold text-slate-400">
              {isSuperAdmin ? 'التحكم الشامل في النظام' : `إدارة أعضاء مساحة: ${currentSpace?.name || 'الافتراضية'}`}
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

      {/* نموذج الإضافة */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
        <h4 className="text-lg font-black text-slate-800 dark:text-white mb-8 flex items-center gap-3 flex-row-reverse">
          <UserPlus size={20} className="text-primary" /> إضافة عضو جديد للقسم
        </h4>
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <input required type="text" placeholder="الاسم الكامل" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary transition-all" />
          <input required type="text" placeholder="اسم المستخدم" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary transition-all" />
          
          <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none cursor-pointer">
            <option value="employee">موظف</option>
            {isSuperAdmin && <option value="manager">مدير مساحة</option>}
            {isSuperAdmin && <option value="admin">أدمن نظام</option>}
          </select>

          {isSuperAdmin && (
            <select value={newUser.spaceId} onChange={e => setNewUser({...newUser, spaceId: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none cursor-pointer">
              <option value="master_space">المساحة الرئيسية</option>
              {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}

          <button type="submit" className="lg:col-span-4 bg-primary text-white py-5 rounded-2xl font-black shadow-lg hover:shadow-primary/20 hover:-translate-y-1 active:scale-95 transition-all">
            تأكيد التعيين في النظام
          </button>
        </form>
      </div>

      {/* قائمة المستخدمين */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-4">الأعضاء الحاليين</h4>
        <div className="grid gap-4">
          {visibleUsers.map(u => (
            <div key={u.id} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${u.isActive ? 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 shadow-sm' : 'bg-slate-100/50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 opacity-60'}`}>
              
              <div className="flex items-center gap-5 flex-row-reverse">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${u.isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'}`}>
                  {u.fullName.substring(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg">{u.fullName}</h3>
                    {getRoleBadge(u.role)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-1 justify-end">
                    <span className="flex items-center gap-1">{u.username} <Mail size={12}/></span>
                    {isSuperAdmin && <span className="flex items-center gap-1 text-primary">| {spaces.find(s => s.id === u.spaceId)?.name || 'الرئيسية'} <Building2 size={12}/></span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleUserStatus(u.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                    u.isActive 
                      ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' 
                      : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white shadow-lg'
                  }`}
                >
                  {u.isActive ? <UserMinus size={18} /> : <UserCheck size={18} />}
                  {u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                </button>

                <button
                  onClick={() => deleteUser(u.id)}
                  className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          {visibleUsers.length === 0 && (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <UserX size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="font-black text-slate-400">لا يوجد أعضاء في هذا النطاق حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
