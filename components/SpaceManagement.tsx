
import React, { useState, useEffect } from 'react';
import { Space, User } from '../types';
import { Building2, Plus, Trash2, X, Shield, User as UserIcon } from 'lucide-react';

interface SpaceManagementProps {
  onSpacesUpdate: (spaces: Space[]) => void;
}

const SpaceManagement: React.FC<SpaceManagementProps> = ({ onSpacesUpdate }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerPass, setManagerPass] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('bs_spaces');
    if (saved) setSpaces(JSON.parse(saved));
  }, []);

  const handleAddSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !managerName || !managerPass) return;

    const spaceId = 'space_' + Date.now();
    const managerId = 'mgr_' + Date.now();

    const newSpace: Space = {
      id: spaceId,
      name,
      managerId,
      createdAt: new Date().toISOString()
    };

    const newManager: User = {
      id: managerId,
      username: managerName.toLowerCase().replace(' ', '_'),
      fullName: managerName,
      password: managerPass,
      role: 'admin',
      spaceId: spaceId,
      permissions: { canEdit: true, canViewMedia: true, canViewTasks: true, canManageUsers: true }
    };

    const updatedSpaces = [...spaces, newSpace];
    setSpaces(updatedSpaces);
    localStorage.setItem('bs_spaces', JSON.stringify(updatedSpaces));
    onSpacesUpdate(updatedSpaces);

    // Save the manager to users list
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    localStorage.setItem('bs_users', JSON.stringify([...savedUsers, newManager]));

    setName('');
    setManagerName('');
    setManagerPass('');
    setShowAdd(false);
  };

  const deleteSpace = (id: string) => {
    if (window.confirm('حذف هذه المساحة سيؤدي لإلغاء وصول المدير وموظفيه. هل أنت متأكد؟')) {
      const updated = spaces.filter(s => s.id !== id);
      setSpaces(updated);
      localStorage.setItem('bs_spaces', JSON.stringify(updated));
      onSpacesUpdate(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900">إدارة مساحات العمل</h2>
          <p className="text-slate-500 font-bold">هنا يمكنك منح "نسخ" من البرنامج لمدراء آخرين.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl">
          <Plus size={20} /> مساحة جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {spaces.map(space => (
          <div key={space.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl group hover:border-indigo-500 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Building2 size={24} />
              </div>
              <button onClick={() => deleteSpace(space.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{space.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-bold mb-4">
               <Shield size={14} className="text-indigo-400" />
               معرف المساحة: {space.id}
            </div>
            <p className="text-xs text-slate-400">تاريخ الإنشاء: {new Date(space.createdAt).toLocaleDateString('ar-SA')}</p>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-900">إنشاء مساحة ومدير</h3>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-100 rounded-xl"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddSpace} className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 mb-2 block mr-1 uppercase">اسم النشاط / المساحة</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="مثلاً: شركة التسويق الرقمي" required />
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-400 mb-2 block mr-1 uppercase">اسم المدير الجديد</label>
                  <input type="text" value={managerName} onChange={e => setManagerName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="اسم المدير" required />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 mb-2 block mr-1 uppercase">كلمة مرور المدير</label>
                  <input type="password" value={managerPass} onChange={e => setManagerPass(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="••••••••" required />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl mt-4 transition-all active:scale-95">تجهيز المساحة والمدير</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SpaceManagement;
