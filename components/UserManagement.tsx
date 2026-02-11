
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, X, CheckCircle2, Circle } from 'lucide-react';
import { User, UserPermissions } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPerms, setNewPerms] = useState<UserPermissions>({
    canEdit: true,
    canViewMedia: true,
    canViewTasks: true,
    canManageUsers: false
  });

  useEffect(() => {
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    setUsers(savedUsers);
  }, []);

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('bs_users', JSON.stringify(updatedUsers));
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    const newUser: User = {
      id: Date.now().toString(),
      username: newUsername,
      fullName: newFullName || newUsername,
      password: newPassword,
      role: 'user',
      permissions: newPerms
    };

    saveUsers([...users, newUser]);
    resetForm();
  };

  const resetForm = () => {
    setNewUsername('');
    setNewFullName('');
    setNewPassword('');
    setNewPerms({ canEdit: true, canViewMedia: true, canViewTasks: true, canManageUsers: false });
    setShowAddModal(false);
  };

  const toggleUserPermission = (userId: string, key: keyof UserPermissions) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, permissions: { ...u.permissions, [key]: !u.permissions[key] } };
      }
      return u;
    });
    saveUsers(updated);
  };

  const deleteUser = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      saveUsers(users.filter(u => u.id !== id));
    }
  };

  const PermissionToggle = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}
    >
      {active ? <CheckCircle2 size={12} /> : <Circle size={12} />}
      {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">نظام إدارة الصلاحيات</h2>
          <p className="text-slate-500">تحكم بدقة في ما يمكن لكل موظف فعله أو رؤيته.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
        >
          <UserPlus size={20} />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-sm font-bold text-slate-500">الموظف</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500">الصلاحيات الممنوحة</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-500">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Admin Row */}
            <tr className="bg-indigo-50/30">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">A</div>
                  <div>
                    <div className="font-black text-slate-900">azoos (المدير العام)</div>
                    <div className="text-xs text-indigo-600 font-bold">وصول كامل للنظام</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold">كل شيء</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-400 text-xs italic">أساسي</td>
            </tr>

            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{user.fullName}</div>
                      <div className="text-xs text-slate-400">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    <PermissionToggle label="تعديل" active={user.permissions.canEdit} onClick={() => toggleUserPermission(user.id, 'canEdit')} />
                    <PermissionToggle label="وسائط" active={user.permissions.canViewMedia} onClick={() => toggleUserPermission(user.id, 'canViewMedia')} />
                    <PermissionToggle label="مهام" active={user.permissions.canViewTasks} onClick={() => toggleUserPermission(user.id, 'canViewTasks')} />
                    <PermissionToggle label="إدارة" active={user.permissions.canManageUsers} onClick={() => toggleUserPermission(user.id, 'canManageUsers')} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => deleteUser(user.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h3 className="text-2xl font-black text-slate-900 mb-6">إضافة موظف</h3>
            
            <form onSubmit={handleAddUser} className="space-y-4">
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="الاسم الكامل"
                required
              />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="اسم المستخدم"
                required
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="كلمة المرور"
                required
              />

              <div className="py-4 border-t border-slate-100 mt-4">
                <p className="text-sm font-bold text-slate-700 mb-3">الصلاحيات الافتراضية:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(newPerms).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewPerms(prev => ({ ...prev, [key]: !val }))}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all ${val ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                    >
                      {val ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      {key === 'canEdit' ? 'تعديل' : key === 'canViewMedia' ? 'وسائط' : key === 'canViewTasks' ? 'مهام' : 'إدارة'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                  إنشاء الحساب
                </button>
                <button type="button" onClick={resetForm} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
