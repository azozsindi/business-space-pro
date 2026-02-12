import React, { useState } from 'react';
import { SystemSettings, Space } from '../types';
import { Save, Palette, Layout, Trash2, Plus, Users } from 'lucide-react';

interface SettingsProps {
  settings: SystemSettings;
  onUpdate: (newSettings: SystemSettings) => void;
  onSpacesUpdate?: (spaces: Space[]) => void; 
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onSpacesUpdate }) => {
  const [localSettings, setLocalSettings] = useState(settings);
  
  // قراءة المساحات من التخزين المحلي مباشرة للإدارة
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem('bs_spaces');
    return saved ? JSON.parse(saved) : [];
  });

  const [newSpaceName, setNewSpaceName] = useState('');
  // حالة جديدة لتحديد سعة المستخدمين عند الإنشاء
  const [newUserLimit, setNewUserLimit] = useState(5); 

  const handleSave = () => {
    onUpdate(localSettings);
    // حفظ إعدادات النظام
    localStorage.setItem('bs_settings', JSON.stringify(localSettings));
    alert('تم حفظ إعدادات النظام بنجاح');
  };

  const handleAddSpace = () => {
    if (!newSpaceName.trim()) return;
    
    const newSpace: Space = {
      id: `space_${Date.now()}`,
      name: newSpaceName,
      primaryColor: '#4f46e5', // لون افتراضي
      createdAt: new Date().toISOString(),
      userLimit: newUserLimit // إضافة السعة هنا
    };

    const updatedSpaces = [...spaces, newSpace];
    setSpaces(updatedSpaces);
    setNewSpaceName('');
    
    // تحديث الأب (App.tsx) وحفظ التخزين
    if (onSpacesUpdate) onSpacesUpdate(updatedSpaces);
    localStorage.setItem('bs_spaces', JSON.stringify(updatedSpaces));
  };

  const updateSpaceLimit = (id: string, limit: number) => {
    const updatedSpaces = spaces.map(s => s.id === id ? { ...s, userLimit: limit } : s);
    setSpaces(updatedSpaces);
    if (onSpacesUpdate) onSpacesUpdate(updatedSpaces);
    localStorage.setItem('bs_spaces', JSON.stringify(updatedSpaces));
  };

  const deleteSpace = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المساحة؟ سيتم فقدان البيانات المرتبطة بها.')) {
      const updatedSpaces = spaces.filter(s => s.id !== id);
      setSpaces(updatedSpaces);
      if (onSpacesUpdate) onSpacesUpdate(updatedSpaces);
      localStorage.setItem('bs_spaces', JSON.stringify(updatedSpaces));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-right pb-20" dir="rtl">
      
      {/* 1. إعدادات المظهر */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="text-2xl font-black mb-6 flex items-center gap-3 flex-row-reverse dark:text-white">
          <Palette className="text-primary" /> إعدادات الهوية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">اسم النظام (Brand Name)</label>
            <input 
              value={localSettings.brandName}
              onChange={e => setLocalSettings({...localSettings, brandName: e.target.value})}
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500">اللون الرئيسي</label>
            <div className="flex items-center gap-4">
              <input 
                type="color"
                value={localSettings.primaryColor}
                onChange={e => setLocalSettings({...localSettings, primaryColor: e.target.value})}
                className="w-16 h-12 rounded-xl cursor-pointer bg-transparent border-0 p-0"
              />
              <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900 dark:text-slate-400 px-3 py-2 rounded-lg font-bold">{localSettings.primaryColor}</span>
            </div>
          </div>
        </div>

        <button onClick={handleSave} className="mt-8 w-full md:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20">
          <Save size={20} /> حفظ التغييرات
        </button>
      </div>

      {/* 2. إدارة المساحات والسعة */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 transition-colors">
        <h3 className="text-2xl font-black mb-8 flex items-center gap-3 flex-row-reverse dark:text-white">
          <Layout className="text-primary" /> إدارة المساحات والسعة
        </h3>

        {/* إضافة مساحة جديدة */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-[2rem]">
          <input 
            placeholder="اسم المساحة الجديدة..." 
            value={newSpaceName}
            onChange={e => setNewSpaceName(e.target.value)}
            className="flex-1 p-4 bg-white dark:bg-slate-800 dark:text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary font-bold shadow-sm"
          />
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-2xl px-4 shadow-sm">
            <Users size={18} className="text-slate-400 ml-2" />
            <input 
              type="number"
              placeholder="السعة"
              value={newUserLimit}
              onChange={e => setNewUserLimit(parseInt(e.target.value))}
              className="w-20 p-2 bg-transparent border-none outline-none font-black text-center dark:text-white"
            />
          </div>
          <button onClick={handleAddSpace} className="bg-primary text-white p-4 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-indigo-500/20">
            <Plus size={24} />
          </button>
        </div>

        {/* قائمة المساحات */}
        <div className="space-y-4">
          {spaces.map(space => (
            <div key={space.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-all">
              
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: space.primaryColor || '#6366f1' }}>
                  {space.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-lg dark:text-white">{space.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">ID: {space.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 pt-4 md:pt-0 md:pr-4">
                <div className="text-center">
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">سعة الفريق</label>
                  <input 
                    type="number" 
                    value={space.userLimit || 5}
                    onChange={(e) => updateSpaceLimit(space.id, parseInt(e.target.value))}
                    className="w-20 bg-white dark:bg-slate-800 text-center font-black text-primary rounded-xl py-2 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-primary outline-none text-sm"
                  />
                </div>
                
                <button onClick={() => deleteSpace(space.id)} className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
          
          {spaces.length === 0 && (
            <div className="text-center py-10 text-slate-400 font-bold opacity-50">
              لا توجد مساحات عمل مضافة حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
