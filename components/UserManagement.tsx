
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, UserPlus, Trash2, X, CheckCircle2, Circle, 
  User as UserIcon, Lock, Settings2, Building2, Edit3, 
  Save, ShieldAlert, Eye, EyeOff, KeyRound, Search
} from 'lucide-react';
import { User, UserPermissions, Space } from '../types';

interface UserManagementProps {
  currentUser: User;
  isSuperAdmin?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, isSuperAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    spaceId: '',
    role: 'user' as 'admin' | 'user',
    permissions: {
      canEdit: true,
      canViewMedia: true,
      canViewTasks: true,
      canManageUsers: false
    }
  });

  useEffect(() => {
    loadData();
  }, [currentUser, isSuperAdmin]);

  const loadData = () => {
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    const savedSpaces = JSON.parse(localStorage.getItem('bs_spaces') || '[]');
    setSpaces(savedSpaces);
    
    if (isSuperAdmin) {
      // السوبر أدمن يرى الجميع ما عدا نفسه
      setUsers(savedUsers.filter((u: User) => u.username !== 'azoos'));
    } else {
      // المدير يرى فريقه فقط في نفس المساحة
      const myTeam = savedUsers.filter((u: User) => u.spaceId === currentUser.spaceId && u.id !== currentUser.id);
      setUsers(myTeam);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      password: '',
      spaceId: isSuperAdmin ? (spaces[0]?.id || 'master_space') : currentUser.spaceId,
      role: 'user',
      permissions: { canEdit: true, canViewMedia: true, canViewTasks: true, canManageUsers: false }
    });
    setEditingUser(null);
    setShowModal(null);
    setShowPassword(false);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      password: user.password || '', // جلب الباسورد القديم لعرضه أو تعديله
      spaceId: user.spaceId,
      role: user.role as 'admin' | 'user',
      permissions: { ...user.permissions }
    });
    setShowModal('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    
    let updatedList;
    if (showModal === 'add') {
      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substr(2, 9),
        username: formData.username.toLowerCase().trim(),
        fullName: formData.fullName,
        password: formData.password,
        role: formData.role,
        spaceId: isSuperAdmin ? formData.spaceId : currentUser.spaceId,
        permissions: formData.permissions
      };
      updatedList = [...savedUsers, newUser];
    } else {
      updatedList = savedUsers.map((u: User) => {
        if (u.id === editingUser?.id) {
          return {
            ...u,
            username: formData.username.toLowerCase().trim(),
            fullName: formData.fullName,
            password: formData.password, // يتم حفظ الباسورد الجديد هنا
            role: formData.role,
            spaceId: isSuperAdmin ? formData.spaceId : u.spaceId,
            permissions: formData.permissions
          };
        }
        return u;
      });
    }

    localStorage.setItem('bs_users', JSON.stringify(updatedList));
    setSuccessMsg(showModal === 'add' ? 'تم إنشاء الحساب بنجاح' : 'تم تحديث بيانات الحساب وكلمة المرور');
    loadData();
    setTimeout(() => {
      setSuccessMsg('');
      resetForm();
    }, 1500);
  };

  const deleteUser = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) {
      const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
      const updated = savedUsers.filter((u: User) => u.id !== id);
      localStorage.setItem('bs_users', JSON.stringify(updated));
      loadData();
    }
  };

  const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || (id === 'master_space' ? 'الإدارة العامة' : "مساحة عمل");

  const filteredUsers = users.filter(u => 
    u.fullName.includes(searchTerm) || 
    u.username.includes(searchTerm) ||
    getSpaceName(u.spaceId).includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto py-8 text-right">
      <div className="flex flex-col md:flex-row-reverse md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">{isSuperAdmin ? 'إدارة جميع الحسابات والفروع' : `إدارة موظفي ${getSpaceName(currentUser.spaceId)}`}</h2>
          <p className="text-slate-500 font-bold">يمكنك إضافة، تعديل كلمات المرور، أو نقل الموظفين بين الفروع.</p>
        </div>
        <div className="flex flex-row-reverse items-center gap-4">
           <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary" size={18} />
              <input 
                type="text" 
                placeholder="ابحث عن مدير أو موظف..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 rounded-2xl py-4 pr-12 pl-6 text-sm font-bold w-64 outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
              />
           </div>
           <button onClick={() => { resetForm(); setShowModal('add'); }} className="flex flex-row-reverse items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black hover:opacity-90 transition-all shadow-xl active:scale-95">
             <UserPlus size={20} /> إضافة مستخدم
           </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex flex-row-reverse items-center gap-4 text-emerald-700 font-black animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={24} /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-300 font-black italic text-xl">
             لا يوجد نتائج تطابق بحثك...
          </div>
        )}
        {filteredUsers.map(user => (
          <div key={user.id} className={`bg-white p-8 rounded-[2.8rem] border-2 transition-all relative overflow-hidden group ${user.role === 'admin' ? 'border-amber-100 shadow-amber-100/50' : 'border-slate-50 shadow-slate-100'} shadow-xl hover:-translate-y-2 hover:border-primary`}>
             {user.role === 'admin' && (
               <div className="absolute -top-1 -left-1 bg-amber-500 text-white text-[9px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-tighter">MANAGER</div>
             )}
             
             <div className="flex flex-row-reverse items-center justify-between mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl transition-all ${user.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                   {user.fullName.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(user)} className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl hover:bg-white hover:shadow-lg" title="تعديل البيانات وكلمة المرور">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="p-3 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl hover:bg-white hover:shadow-lg" title="حذف الحساب">
                    <Trash2 size={18} />
                  </button>
                </div>
             </div>
             
             <div className="text-right mb-6">
                <h4 className="text-xl font-black text-slate-800">{user.fullName}</h4>
                <p className="text-sm text-slate-400 font-bold flex flex-row-reverse items-center gap-1">@{user.username} <KeyRound size={12} className="opacity-30" /></p>
                <div className={`flex flex-row-reverse items-center gap-2 mt-4 font-black text-[10px] w-fit px-4 py-2 rounded-xl mr-auto ${user.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-indigo-50 text-primary'}`}>
                  <Building2 size={12} /> {getSpaceName(user.spaceId)}
                </div>
             </div>

             <div className="flex flex-wrap gap-2 flex-row-reverse">
                {user.permissions.canEdit && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">تحرير</span>}
                {user.permissions.canViewMedia && <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">وسائط</span>}
                {user.permissions.canManageUsers && <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full border border-rose-100">إدارة حسابات</span>}
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative border border-white/20">
              <div className="flex flex-row-reverse items-center justify-between mb-8">
                <div className="text-right">
                  <h3 className="text-2xl font-black text-slate-900">{showModal === 'add' ? 'إضافة مستخدم جديد' : 'تعديل بيانات الحساب'}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-1">تأكد من حفظ كلمة المرور الجديدة جيداً.</p>
                </div>
                <button onClick={resetForm} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6 text-right overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1">الاسم الكامل</label>
                    <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right" required />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1">اسم المستخدم</label>
                    <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right text-left" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="relative">
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1 flex flex-row-reverse items-center gap-2">
                       <Lock size={12} className="text-primary" /> كلمة المرور (تغيير فوري)
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        className="w-full p-5 bg-indigo-50/30 border border-indigo-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-black text-right" 
                        placeholder="أدخل الباسورد الجديد هنا..."
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-600 mt-2 font-bold">* تنبيه: تغيير الباسورد هنا سيتم تطبيقه فوراً على دخول المستخدم.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1">نوع الحساب</label>
                    <select 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value as any})}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right"
                    >
                      <option value="user">موظف (User)</option>
                      <option value="admin">مدير فرع (Admin)</option>
                    </select>
                  </div>
                  {isSuperAdmin && (
                    <div>
                      <label className="text-xs font-black text-slate-400 mb-3 block mr-1">الفرع / مساحة العمل</label>
                      <select 
                        value={formData.spaceId} 
                        onChange={e => setFormData({...formData, spaceId: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right"
                      >
                        <option value="master_space">الإدارة العامة</option>
                        {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase mb-4 flex flex-row-reverse items-center gap-2">
                     <ShieldAlert size={14} className="text-primary" /> صلاحيات النظام
                   </p>
                   
                   <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: 'canEdit', label: 'صلاحية التحرير والإضافة' },
                        { key: 'canViewMedia', label: 'رؤية المرفقات والوسائط' },
                        { key: 'canViewTasks', label: 'إدارة قائمة المهام' },
                        { key: 'canManageUsers', label: 'إدارة حسابات الفريق' },
                      ].map((perm) => (
                        <button 
                          key={perm.key}
                          type="button" 
                          onClick={() => setFormData({...formData, permissions: {...formData.permissions, [perm.key]: !formData.permissions[perm.key as keyof UserPermissions]}})} 
                          className="flex flex-row-reverse items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary transition-all"
                        >
                          <span className="text-sm font-bold text-slate-700">{perm.label}</span>
                          {formData.permissions[perm.key as keyof UserPermissions] ? <CheckCircle2 size={24} className="text-primary" /> : <Circle size={24} className="text-slate-200" />}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 py-6 bg-primary text-white rounded-2xl font-black hover:opacity-90 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                    <Save size={20} /> {showModal === 'add' ? 'إنشاء الحساب' : 'حفظ وتحديث كلمة المرور'}
                  </button>
                  <button type="button" onClick={resetForm} className="px-10 py-6 bg-slate-100 text-slate-500 rounded-2xl font-black hover:bg-slate-200 transition-all">إلغاء</button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
