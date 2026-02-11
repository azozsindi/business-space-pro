
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, X, CheckCircle2, Circle, User as UserIcon, Lock, Settings2 } from 'lucide-react';
import { User, UserPermissions } from '../types';

interface UserManagementProps {
  currentUser: User;
}

const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPerms, setNewPerms] = useState<UserPermissions>({
    canEdit: true,
    canViewMedia: true,
    canViewTasks: true,
    canManageUsers: false // الموظف العادي لا يدير مستخدمين آخرين
  });

  useEffect(() => {
    // قراءة جميع المستخدمين وتصفية التابعين لنفس المساحة فقط
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    const myTeam = savedUsers.filter((u: User) => u.spaceId === currentUser.spaceId && u.id !== currentUser.id);
    setUsers(myTeam);
  }, [currentUser]);

  const saveUsersToGlobal = (myUpdatedTeam: User[]) => {
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    // الاحتفاظ بمستخدمي المساحات الأخرى كما هم
    const otherUsers = savedUsers.filter((u: User) => u.spaceId !== currentUser.spaceId || u.id === currentUser.id);
    const updatedGlobal = [...otherUsers, ...myUpdatedTeam];
    
    localStorage.setItem('bs_users', JSON.stringify(updatedGlobal));
    setUsers(myUpdatedTeam);
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
      spaceId: currentUser.spaceId, // يرث نفس معرف المساحة الخاص بالمدير
      permissions: newPerms
    };

    saveUsersToGlobal([...users, newUser]);
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
    if (window.confirm('هل أنت متأكد من سحب صلاحيات وحذف هذا الموظف من فريقك؟')) {
      saveUsersToGlobal(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 text-right">
      <div className="flex flex-row-reverse items-center justify-between mb-12">
        <div>
          <h2 className="text-4xl font-black text-slate-900 mb-2">إدارة فريق العمل</h2>
          <p className="text-slate-500 font-bold">بصفتك مديراً للمساحة، يمكنك التحكم في وصول موظفيك.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex flex-row-reverse items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.8rem] font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200">
          <UserPlus size={20} /> إضافة موظف جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(user => (
          <div key={user.id} className="bg-white p-8 rounded-[2.8rem] border border-slate-100 shadow-xl flex flex-col group hover:border-indigo-500 transition-all relative overflow-hidden">
             <div className="flex flex-row-reverse items-center justify-between mb-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                   {user.fullName.charAt(0)}
                </div>
                <button onClick={() => deleteUser(user.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors">
                  <Trash2 size={22} />
                </button>
             </div>
             
             <div className="text-right mb-6">
                <h4 className="text-xl font-black text-slate-800">{user.fullName}</h4>
                <p className="text-sm text-slate-400 font-bold">@{user.username}</p>
             </div>

             <div className="flex flex-wrap gap-2 flex-row-reverse mb-6">
                {user.permissions.canEdit && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full">صلاحية التحرير</span>}
                {user.permissions.canViewMedia && <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full">رؤية الوسائط</span>}
             </div>

             <div className="pt-6 border-t border-slate-50 mt-auto">
                <div className="flex flex-row-reverse items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                   <ShieldCheck size={14} className="text-indigo-400" /> موظف معتمد
                </div>
             </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-300 font-black italic border-4 border-dashed border-slate-50 rounded-[3rem]">
            فريقك فارغ حالياً، ابدأ بإضافة موظفيك لمشاركتهم العمل.
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
              <div className="flex flex-row-reverse items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">إضافة موظف للفريق</h3>
                <button onClick={() => setShowAddModal(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleAddUser} className="space-y-6 text-right">
                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">اسم الموظف الكامل</label>
                  <input type="text" value={newFullName} onChange={e => setNewFullName(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold text-right" placeholder="مثلاً: أحمد فهد" required />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">اسم المستخدم (للدخول)</label>
                  <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold text-right" placeholder="ahmed_99" required />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">كلمة السر</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 font-bold text-right" placeholder="••••••••" required />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                   <p className="text-xs font-black text-slate-400 uppercase mb-2">صلاحيات الموظف</p>
                   <button type="button" onClick={() => setNewPerms({...newPerms, canEdit: !newPerms.canEdit})} className="w-full flex flex-row-reverse items-center justify-between p-2">
                      <span className="text-sm font-bold text-slate-700">السماح بإضافة وتعديل المهام</span>
                      {newPerms.canEdit ? <CheckCircle2 size={20} className="text-indigo-600" /> : <Circle size={20} className="text-slate-300" />}
                   </button>
                   <button type="button" onClick={() => setNewPerms({...newPerms, canViewMedia: !newPerms.canViewMedia})} className="w-full flex flex-row-reverse items-center justify-between p-2">
                      <span className="text-sm font-bold text-slate-700">السماح برؤية المرفقات والملفات</span>
                      {newPerms.canViewMedia ? <CheckCircle2 size={20} className="text-indigo-600" /> : <Circle size={20} className="text-slate-300" />}
                   </button>
                </div>

                <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-2xl shadow-indigo-200 mt-4 transition-all active:scale-95">إنشاء حساب الموظف</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
