
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, X, CheckCircle2, Circle, User as UserIcon, Lock, Settings2, Building2, Edit3, Save, ShieldAlert } from 'lucide-react';
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
  
  // Form States
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
      spaceId: isSuperAdmin ? (spaces[0]?.id || '') : currentUser.spaceId,
      role: 'user',
      permissions: { canEdit: true, canViewMedia: true, canViewTasks: true, canManageUsers: false }
    });
    setEditingUser(null);
    setShowModal(null);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      fullName: user.fullName,
      password: user.password || '',
      spaceId: user.spaceId,
      role: user.role as 'admin' | 'user',
      permissions: { ...user.permissions }
    });
    setShowModal('edit');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    
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
      
      const updatedUsers = [...savedUsers, newUser];
      localStorage.setItem('bs_users', JSON.stringify(updatedUsers));
    } else if (showModal === 'edit' && editingUser) {
      const updatedUsers = savedUsers.map((u: User) => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            username: formData.username.toLowerCase().trim(),
            fullName: formData.fullName,
            password: formData.password || u.password,
            role: formData.role,
            spaceId: isSuperAdmin ? formData.spaceId : u.spaceId, // فقط السوبر أدمن ينقل بين المساحات
            permissions: formData.permissions
          };
        }
        return u;
      });
      localStorage.setItem('bs_users', JSON.stringify(updatedUsers));
    }

    loadData();
    resetForm();
  };

  const deleteUser = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) {
      const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
      const updated = savedUsers.filter((u: User) => u.id !== id);
      localStorage.setItem('bs_users', JSON.stringify(updated));
      loadData();
    }
  };

  const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || (id === 'master_space' ? 'الإدارة العامة' : "مساحة غير معروفة");

  return (
    <div className="max-w-6xl mx-auto py-8 text-right">
      <div className="flex flex-row-reverse items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">{isSuperAdmin ? 'إدارة جميع الحسابات والفروع' : `إدارة موظفي ${getSpaceName(currentUser.spaceId)}`}</h2>
          <p className="text-slate-500 font-bold">يمكنك إضافة، تعديل، أو تغيير صلاحيات الوصول للمستخدمين.</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal('add'); }} className="flex flex-row-reverse items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.8rem] font-black hover:opacity-90 transition-all shadow-2xl">
          <UserPlus size={20} /> إضافة مستخدم جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(user => (
          <div key={user.id} className="bg-white p-8 rounded-[2.8rem] border border-slate-100 shadow-xl flex flex-col group hover:border-primary transition-all relative overflow-hidden">
             <div className="flex flex-row-reverse items-center justify-between mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                   {user.fullName.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditClick(user)} className="p-3 text-slate-300 hover:text-indigo-600 transition-colors bg-slate-50 rounded-xl" title="تعديل">
                    <Edit3 size={18} />
                  </button>
                  <button onClick={() => deleteUser(user.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors bg-slate-50 rounded-xl" title="حذف">
                    <Trash2 size={18} />
                  </button>
                </div>
             </div>
             
             <div className="text-right mb-6">
                <h4 className="text-xl font-black text-slate-800">{user.fullName}</h4>
                <p className="text-sm text-slate-400 font-bold">@{user.username}</p>
                <div className="flex flex-row-reverse items-center gap-2 mt-3 text-primary font-bold text-xs bg-indigo-50/50 w-fit px-3 py-1.5 rounded-lg mr-auto">
                  <Building2 size={12} /> {getSpaceName(user.spaceId)}
                </div>
             </div>

             <div className="flex flex-wrap gap-2 flex-row-reverse mb-6">
                {user.role === 'admin' && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100">مدير فرع</span>}
                {user.role === 'user' && <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-full border border-slate-100">موظف</span>}
                {user.permissions.canEdit && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full border border-emerald-100">صلاحية التحرير</span>}
             </div>

             <div className="pt-6 border-t border-slate-50 mt-auto">
                <div className="flex flex-row-reverse items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                   <ShieldCheck size={14} className="text-primary" /> {user.role === 'admin' ? 'صلاحيات إدارية كاملة' : 'موظف تحت الإشراف'}
                </div>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex flex-row-reverse items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">{showModal === 'add' ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}</h3>
                <button onClick={resetForm} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleSave} className="space-y-6 text-right overflow-y-auto pr-2 custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">الاسم الكامل</label>
                    <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right" placeholder="الاسم الظاهر..." required />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">اسم المستخدم</label>
                    <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right" placeholder="Username" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">كلمة السر</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right" placeholder={showModal === 'edit' ? 'اتركها فارغة لعدم التغيير' : '••••••••'} required={showModal === 'add'} />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">نوع الحساب</label>
                    <select 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value as any})}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right"
                    >
                      <option value="user">موظف عادي</option>
                      <option value="admin">مدير فرع</option>
                    </select>
                  </div>
                </div>

                {isSuperAdmin && (
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase flex flex-row-reverse items-center gap-2">
                      <Building2 size={12} className="text-primary" /> تحديد مساحة العمل (الفرع)
                    </label>
                    <select 
                      value={formData.spaceId} 
                      onChange={e => setFormData({...formData, spaceId: e.target.value})}
                      className="w-full p-5 bg-indigo-50/50 border border-indigo-100 text-indigo-900 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-black text-right"
                    >
                      <option value="master_space">الإدارة العامة</option>
                      {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">* يمكنك نقل الموظف من فرع إلى فرع آخر عبر هذا الخيار.</p>
                  </div>
                )}

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase mb-4 flex flex-row-reverse items-center gap-2">
                     <ShieldAlert size={14} className="text-primary" /> تحديد صلاحيات الموظف في النظام
                   </p>
                   
                   <div className="grid grid-cols-1 gap-3">
                      <button type="button" onClick={() => setFormData({...formData, permissions: {...formData.permissions, canEdit: !formData.permissions.canEdit}})} className="flex flex-row-reverse items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary transition-all">
                        <span className="text-sm font-bold text-slate-700">السماح بتعديل المهام والملاحظات</span>
                        {formData.permissions.canEdit ? <CheckCircle2 size={24} className="text-primary" /> : <Circle size={24} className="text-slate-200" />}
                      </button>

                      <button type="button" onClick={() => setFormData({...formData, permissions: {...formData.permissions, canViewMedia: !formData.permissions.canViewMedia}})} className="flex flex-row-reverse items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary transition-all">
                        <span className="text-sm font-bold text-slate-700">رؤية ورفع الوسائط (صور/فيديو/ملفات)</span>
                        {formData.permissions.canViewMedia ? <CheckCircle2 size={24} className="text-primary" /> : <Circle size={24} className="text-slate-200" />}
                      </button>

                      <button type="button" onClick={() => setFormData({...formData, permissions: {...formData.permissions, canViewTasks: !formData.permissions.canViewTasks}})} className="flex flex-row-reverse items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-primary transition-all">
                        <span className="text-sm font-bold text-slate-700">عرض قائمة المهام اليومية</span>
                        {formData.permissions.canViewTasks ? <CheckCircle2 size={24} className="text-primary" /> : <Circle size={24} className="text-slate-200" />}
                      </button>

                      {isSuperAdmin && (
                        <button type="button" onClick={() => setFormData({...formData, permissions: {...formData.permissions, canManageUsers: !formData.permissions.canManageUsers}})} className="flex flex-row-reverse items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl hover:border-primary transition-all">
                          <span className="text-sm font-black text-indigo-700">صلاحية إدارة الحسابات الأخرى</span>
                          {formData.permissions.canManageUsers ? <CheckCircle2 size={24} className="text-indigo-500" /> : <Circle size={24} className="text-indigo-200" />}
                        </button>
                      )}
                   </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 py-6 bg-primary text-white rounded-2xl font-black hover:opacity-90 shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                    <Save size={20} /> {showModal === 'add' ? 'إنشاء الحساب الآن' : 'حفظ التعديلات'}
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
