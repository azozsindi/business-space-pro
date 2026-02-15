import React, { useState, useEffect } from 'react';
import { User, UserRole, Space } from '../types';
import { supabase } from '../supabaseClient'; // الربط الجديد
import { 
  Users, UserPlus, ShieldCheck, UserCog, UserCheck, 
  Trash2, Building2, AlertCircle, ShieldAlert, UserX,
  Mail, UserMinus, Shield
} from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  isSuperAdmin: boolean;
  usersList: User[]; 
  onUsersChange: () => void; 
}

const UserManagement: React.FC<UserManagementProps> = ({ 
  currentUser, 
  isSuperAdmin, 
  usersList, 
  onUsersChange 
}) => {
  
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('bs_spaces');
    if (saved) setSpaces(JSON.parse(saved));
  }, []);

  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    role: 'employee' as UserRole,
    spaceId: isSuperAdmin ? 'master_space' : (currentUser.spaceId || 'master_space'),
    password: ''
  });

  const visibleUsers = isSuperAdmin 
    ? usersList.filter(u => u.id !== currentUser.id) 
    : usersList.filter(u => u.spaceId === currentUser.spaceId && u.id !== currentUser.id);

  const currentSpace = spaces.find(s => s.id === (isSuperAdmin ? 'master_space' : currentUser.spaceId));
  const spaceUserCount = usersList.filter(u => u.spaceId === (isSuperAdmin ? 'master_space' : currentUser.spaceId)).length;
  const limit = isSuperAdmin ? Infinity : (currentSpace?.userLimit || 0);

  // --- إضافة مستخدم جديد (أونلاين) ---
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSuperAdmin && spaceUserCount >= limit) {
      alert(`⚠️ خطأ: لقد وصلت للحد الأقصى المسموح به لهذه المساحة (${limit}).`);
      return;
    }

    if (usersList.find(u => u.username === newUser.username)) {
      alert("⚠️ اسم المستخدم هذا موجود مسبقاً");
      return;
    }

    // الحفظ في سوبابيس
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        username: newUser.username,
        full_name: newUser.fullName,
        role: newUser.role,
        space_id: isSuperAdmin ? newUser.spaceId : currentUser.spaceId,
        password: newUser.password || '123456',
        is_active: true
      }]);

    if (error) {
      alert("خطأ في الربط: " + error.message);
    } else {
      alert("✅ تم إنشاء الحساب أونلاين بنجاح!");
      onUsersChange(); // تحديث القائمة
      setNewUser({ ...newUser, username: '', fullName: '', password: '' });
    }
  };

  // --- تعطيل / تفعيل الدخول (أونلاين) ---
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentStatus })
      .eq('id', userId);

    if (!error) onUsersChange();
  };

  // --- حذف عضو (أونلاين) ---
  const deleteUser = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العضو نهائياً؟')) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
      
      if (!error) onUsersChange();
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
            <h3 className="text-2xl font-black dark:text-white">إدارة فريق العمل (Cloud)</h3>
            <p className="text-sm font-bold text-slate-400">
              {isSuperAdmin ? 'التحكم الشامل في الموظفين أونلاين' : `إدارة أعضاء مساحة: ${currentSpace?.name || 'الخاصة بك'}`}
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
        <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 px-2">الاسم الكامل</label>
            <input required type="text" placeholder="الاسم الكامل" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 px-2">اسم المستخدم</label>
            <input required type="text" placeholder="اسم المستخدم" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 px-2">كلمة المرور</label>
            <input required type="password" placeholder="كلمة المرور" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary transition-all" />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 px-2">الرتبة</label>
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none cursor-pointer">
              <option value="employee">موظف</option>
              {isSuperAdmin && <option value="manager">مدير مساحة</option>}
              {isSuperAdmin && <option value="admin">أدمن نظام</option>}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 px-2">المساحة</label>
            <select 
              value={newUser.spaceId} 
              disabled={!isSuperAdmin}
              onChange={e => setNewUser({...newUser, spaceId: e.target.value})} 
              className={`w-full bg-slate-50 dark:bg-slate-900 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none ${!isSuperAdmin ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <option value="master_space">المساحة الرئيسية</option>
              {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="flex items-end">
            <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all">
              تأكيد التعيين أونلاين
            </button>
          </div>
        </form>
      </div>

      {/* قائمة المستخدمين */}
      <div className="space-y-4">
        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-4">الأعضاء الخاضعين لإدارتك</h4>
        <div className="grid gap-4">
          {visibleUsers.map(u => (
            <div key={u.id} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${u.isActive ? 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 shadow-sm' : 'bg-slate-100/50 dark:bg-slate-900/50 border-dashed border-slate-200 dark:border-slate-800 opacity-60'}`}>
              
              <div className="flex items-center gap-5 flex-row-reverse text-right">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl ${u.isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-400'}`}>
                  {u.fullName.substring(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-row-reverse">
                    <h3 className="font-black text-slate-800 dark:text-white text-lg">{u.fullName}</h3>
                    {getRoleBadge(u.role)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-1 justify-end">
                    <span className="flex items-center gap-1">@{u.username} <Mail size={12}/></span>
                    <span className="flex items-center gap-1 text-primary">| {u.spaceId} <Building2 size={12}/></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleUserStatus(u.id, u.isActive)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                    u.isActive 
                      ? 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white' 
                      : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white shadow-lg'
                  }`}
                >
                  {u.isActive ? <UserMinus size={18} /> : <UserCheck size={18} />}
                  {u.isActive ? 'تعطيل الدخول' : 'تفعيل الدخول'}
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
              <p className="font-black text-slate-400">لا يوجد موظفين مسجلين حالياً</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
