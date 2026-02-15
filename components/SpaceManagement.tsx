import React, { useState, useEffect } from 'react';
import { Space, User } from '../types';
import { Building2, Plus, Trash2, X, Shield, User as UserIcon, Key, CheckCircle } from 'lucide-react';

interface SpaceManagementProps {
  onUpdate: (spaces: Space[]) => void;
  // أضفنا هذا التمرير لتحديث قائمة المستخدمين في App.tsx فوراً
  onUsersUpdate?: (users: User[]) => void; 
}

const SpaceManagement: React.FC<SpaceManagementProps> = ({ onUpdate, onUsersUpdate }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [managerUsername, setManagerUsername] = useState('');
  const [managerFullName, setManagerFullName] = useState('');
  const [managerPass, setManagerPass] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bs_spaces');
    if (saved) setSpaces(JSON.parse(saved));
  }, []);

  const handleAddSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !managerUsername || !managerPass) return;

    const spaceId = 'spc_' + Math.random().toString(36).substr(2, 9);
    const managerId = 'mgr_' + Math.random().toString(36).substr(2, 9);

    const newSpace: Space = {
      id: spaceId,
      name,
      managerId,
      primaryColor: '#4f46e5', // لون افتراضي
      userLimit: 10,
      createdAt: new Date().toISOString()
    };

    const newManager: User = {
      id: managerId,
      username: managerUsername.toLowerCase().trim(),
      fullName: managerFullName || managerUsername,
      password: managerPass,
      role: 'admin',
      spaceId: spaceId,
      permissions: { 
        canEdit: true, 
        canViewMedia: true, 
        canViewTasks: true, 
        canManageUsers: true 
      }
    };

    const updatedSpaces = [...spaces, newSpace];
    setSpaces(updatedSpaces);
    localStorage.setItem('bs_spaces', JSON.stringify(updatedSpaces));
    onUpdate(updatedSpaces);

    // تحديث المستخدمين
    const savedUsers = JSON.parse(localStorage.getItem('bs_users_data') || '[]');
    const updatedUsers = [...savedUsers, newManager];
    localStorage.setItem('bs_users_data', JSON.stringify(updatedUsers));
    if (onUsersUpdate) onUsersUpdate(updatedUsers);

    // إضافة إشعار
    const savedNotifs = JSON.parse(localStorage.getItem('bs_notifications') || '[]');
    const newNotif = {
      id: Date.now().toString(),
      message: `تم إنشاء مساحة عمل جديدة: ${name}`,
      user: 'النظام',
      spaceId: 'master_space',
      time: new Date().toLocaleTimeString('ar-SA'),
      date: new Date().toLocaleDateString('ar-SA')
    };
    localStorage.setItem('bs_notifications', JSON.stringify([newNotif, ...savedNotifs]));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setManagerUsername('');
    setManagerFullName('');
    setManagerPass('');
    setShowAdd(false);
  };

  const deleteSpace = (id: string) => {
    if (window.confirm('⚠️ تحذير: حذف المساحة سيؤدي لحذف وصول المدير وجميع موظفيه وبياناتهم. هل أنت متأكد؟')) {
      const updated = spaces.filter(s => s.id !== id);
      setSpaces(updated);
      localStorage.setItem('bs_spaces', JSON.stringify(updated));
      onUpdate(updated);
      
      const savedUsers = JSON.parse(localStorage.getItem('bs_users_data') || '[]');
      const filteredUsers = savedUsers.filter((u: User) => u.spaceId !== id);
      localStorage.setItem('bs_users_data', JSON.stringify(filteredUsers));
      if (onUsersUpdate) onUsersUpdate(filteredUsers);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 text-right">
        <div className="order-2 md:order-1">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">إدارة الفروع والمساحات</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">بصفتك المالك، يمكنك منح اشتراكات مستقلة لمدراء الفروع.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="order-1 md:order-2 flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.8rem] font-black hover:scale-105 transition-all shadow-2xl shadow-primary/20"
        >
          <Plus size={20} /> إضافة فرع جديد
        </button>
      </div>

      {showSuccess && (
        <div className="mb-8 flex items-center justify-center gap-3 bg-emerald-500/10 text-emerald-500 p-4 rounded-2xl border border-emerald-500/20 font-black animate-bounce">
          <CheckCircle size={20} /> تم تفعيل الفرع والمدير بنجاح
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {spaces.map(space => (
          <div key={space.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.8rem] border border-slate-100 dark:border-slate-700 shadow-xl group hover:border-primary transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-all group-hover:bg-primary/10"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                <Building2 size={24} />
              </div>
              <button onClick={() => deleteSpace(space.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10 text-right">{space.name}</h3>
            <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400 font-bold mb-6 opacity-60">
               ID: {space.id} <Shield size={12} className="text-primary" />
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
               <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <UserIcon size={18} />
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase">تاريخ الانضمام</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(space.createdAt).toLocaleDateString('ar-SA')}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-10">
                <button onClick={() => setShowAdd(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all dark:text-white"><X size={20} /></button>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">تجهيز فرع جديد</h3>
              </div>
              
              <form onSubmit={handleAddSpace} className="space-y-6 text-right">
                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">اسم النشاط التجاري</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-right dark:text-white" placeholder="مثلاً: فرع الرياض" required />
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">اسم المستخدم للمدير</label>
                  <input type="text" value={managerUsername} onChange={e => setManagerUsername(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-right dark:text-white" placeholder="admin_riyadh" required />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">الاسم الكامل للمدير</label>
                  <input type="text" value={managerFullName} onChange={e => setManagerFullName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-right dark:text-white" placeholder="محمد العتيبي" required />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">كلمة السر المؤقتة</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="password" value={managerPass} onChange={e => setManagerPass(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-right dark:text-white" placeholder="••••••••" required />
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-primary text-white rounded-2xl font-black hover:scale-[1.02] shadow-2xl shadow-primary/20 mt-4 transition-all active:scale-95">تفعيل الفرع والمدير</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SpaceManagement;
