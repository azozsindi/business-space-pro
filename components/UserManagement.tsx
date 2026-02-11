
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, X, CheckCircle2, Circle, User as UserIcon, Lock, Settings2, Building2 } from 'lucide-react';
import { User, UserPermissions, Space } from '../types';

interface UserManagementProps {
  currentUser: User;
  isSuperAdmin?: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser, isSuperAdmin }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [targetSpaceId, setTargetSpaceId] = useState(currentUser.spaceId);
  const [newPerms, setNewPerms] = useState<UserPermissions>({
    canEdit: true,
    canViewMedia: true,
    canViewTasks: true,
    canManageUsers: false
  });

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    const savedSpaces = JSON.parse(localStorage.getItem('bs_spaces') || '[]');
    setSpaces(savedSpaces);
    
    if (isSuperAdmin) {
      setUsers(savedUsers.filter((u: User) => u.role !== 'super-admin'));
    } else {
      const myTeam = savedUsers.filter((u: User) => u.spaceId === currentUser.spaceId && u.id !== currentUser.id);
      setUsers(myTeam);
    }
  }, [currentUser, isSuperAdmin]);

  const saveUsersToGlobal = (allUsers: User[]) => {
    localStorage.setItem('bs_users', JSON.stringify(allUsers));
    if (isSuperAdmin) {
      setUsers(allUsers.filter((u: User) => u.role !== 'super-admin'));
    } else {
      setUsers(allUsers.filter((u: User) => u.spaceId === currentUser.spaceId && u.id !== currentUser.id));
    }
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const newUser: User = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      username: newUsername.toLowerCase().trim(),
      fullName: newFullName || newUsername,
      password: newPassword,
      role: 'user',
      spaceId: isSuperAdmin ? targetSpaceId : currentUser.spaceId,
      permissions: newPerms
    };

    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    saveUsersToGlobal([...savedUsers, newUser]);
    resetForm();
  };

  const resetForm = () => {
    setNewUsername('');
    setNewFullName('');
    setNewPassword('');
    setNewPerms({ canEdit: true, canViewMedia: true, canViewTasks: true, canManageUsers: false });
    setShowAddModal(false);
  };

  const deleteUser = (id: string) => {
    if (window.confirm('هل أنت متأكد من سحب صلاحيات وحذف هذا الحساب؟')) {
      const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
      saveUsersToGlobal(savedUsers.filter((u: User) => u.id !== id));
    }
  };

  const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || "مساحة غير معروفة";

  return (
    <div className="max-w-6xl mx-auto py-8 text-right">
      <div className="flex flex-row-reverse items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">{isSuperAdmin ? 'التحكم في جميع الحسابات' : 'إدارة فريق العمل'}</h2>
          <p className="text-slate-500 font-bold">يمكنك مراقبة وإدارة وصول المستخدمين عبر النظام.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex flex-row-reverse items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.8rem] font-black hover:opacity-90 transition-all shadow-2xl">
          <UserPlus size={20} /> إضافة حساب جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(user => (
          <div key={user.id} className="bg-white p-8 rounded-[2.8rem] border border-slate-100 shadow-xl flex flex-col group hover:border-primary transition-all relative overflow-hidden">
             <div className="flex flex-row-reverse items-center justify-between mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black text-2xl group-hover:bg-primary group-hover:text-white transition-all">
                   {user.fullName.charAt(0)}
                </div>
                <button onClick={() => deleteUser(user.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors">
                  <Trash2 size={22} />
                </button>
             </div>
             
             <div className="text-right mb-6">
                <h4 className="text-xl font-black text-slate-800">{user.fullName}</h4>
                <p className="text-sm text-slate-400 font-bold">@{user.username}</p>
                {isSuperAdmin && (
                  <div className="flex flex-row-reverse items-center gap-2 mt-2 text-primary font-bold text-xs">
                    <Building2 size={12} /> {getSpaceName(user.spaceId)}
                  </div>
                )}
             </div>

             <div className="flex flex-wrap gap-2 flex-row-reverse mb-6">
                {user.role === 'admin' && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full">مدير فرع</span>}
                {user.permissions.canEdit && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full">صلاحية التحرير</span>}
             </div>

             <div className="pt-6 border-t border-slate-50 mt-auto">
                <div className="flex flex-row-reverse items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                   <ShieldCheck size={14} className="text-primary" /> {user.role === 'admin' ? 'صلاحيات إدارية' : 'موظف معتمد'}
                </div>
             </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
              <div className="flex flex-row-reverse items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">إنشاء حساب جديد</h3>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleAddUser} className="space-y-6 text-right">
                {isSuperAdmin && (
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">اختيار مساحة العمل</label>
                    <select 
                      value={targetSpaceId} 
                      onChange={e => setTargetSpaceId(e.target.value)}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right"
                    >
                      {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">الاسم الكامل</label>
                  <input type="text" value={newFullName} onChange={e => setNewFullName(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right" placeholder="الاسم هنا..." required />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">اسم المستخدم</label>
                  <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right" placeholder="user_123" required />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">كلمة السر</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-right" placeholder="••••••••" required />
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase mb-2">الصلاحيات</p>
                   <button type="button" onClick={() => setNewPerms({...newPerms, canEdit: !newPerms.canEdit})} className="w-full flex flex-row-reverse items-center justify-between p-2">
                      <span className="text-sm font-bold text-slate-700">تعديل المهام والملاحظات</span>
                      {newPerms.canEdit ? <CheckCircle2 size={20} className="text-primary" /> : <Circle size={20} className="text-slate-300" />}
                   </button>
                </div>

                <button type="submit" className="w-full py-6 bg-primary text-white rounded-2xl font-black hover:opacity-90 shadow-2xl mt-4 transition-all active:scale-95">تأكيد الحساب</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
