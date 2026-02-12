import React, { useState } from 'react';
import { SystemSettings, Space } from '../types';
import { 
  Settings as SettingsIcon, Palette, Building2, 
  Save, Plus, Trash2, CheckCircle2, Layout 
} from 'lucide-react';

interface SettingsProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
  onSpacesUpdate: (spaces: Space[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onSpacesUpdate }) => {
  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem('bs_spaces');
    return saved ? JSON.parse(saved) : [];
  });

  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceColor, setNewSpaceColor] = useState('#4f46e5');

  const saveSettings = (newSettings: SystemSettings) => {
    onUpdate(newSettings);
    localStorage.setItem('bs_settings', JSON.stringify(newSettings));
  };

  const addSpace = () => {
    if (!newSpaceName) return;
    const newSpace: Space = {
      id: Date.now().toString(),
      name: newSpaceName,
      primaryColor: newSpaceColor,
      managerId: '',
      createdAt: new Date().toISOString()
    };
    const updatedSpaces = [...spaces, newSpace];
    setSpaces(updatedSpaces);
    onSpacesUpdate(updatedSpaces);
    localStorage.setItem('bs_spaces', JSON.stringify(updatedSpaces));
    setNewSpaceName('');
  };

  const removeSpace = (id: string) => {
    const updatedSpaces = spaces.filter(s => s.id !== id);
    setSpaces(updatedSpaces);
    onSpacesUpdate(updatedSpaces);
    localStorage.setItem('bs_spaces', JSON.stringify(updatedSpaces));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 text-right" dir="rtl">
      {/* قسم هوية النظام */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex items-center gap-4 mb-10 flex-row-reverse">
          <div className="w-12 h-12 bg-indigo-50 text-primary rounded-2xl flex items-center justify-center">
            <Layout size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-800">تخصيص هوية النظام</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-sm font-black text-slate-500 block mr-2">اسم المنصة (Brand Name)</label>
            <input 
              type="text"
              value={settings.brandName}
              onChange={(e) => saveSettings({...settings, brandName: e.target.value})}
              className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-slate-500 block mr-2">اللون الرئيسي للنظام</label>
            <div className="flex gap-4">
              <input 
                type="color"
                value={settings.primaryColor}
                onChange={(e) => saveSettings({...settings, primaryColor: e.target.value})}
                className="w-20 h-14 rounded-xl cursor-pointer border-none bg-transparent"
              />
              <input 
                type="text"
                value={settings.primaryColor}
                onChange={(e) => saveSettings({...settings, primaryColor: e.target.value})}
                className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 font-mono font-bold text-slate-700 text-center outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* قسم إدارة مساحات العمل */}
      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100">
        <div className="flex items-center gap-4 mb-10 flex-row-reverse">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Building2 size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-800">إدارة مساحات العمل (Spaces)</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input 
            type="text"
            placeholder="اسم المساحة (مثلاً: القسم الهندسي)"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary"
          />
          <input 
            type="color"
            value={newSpaceColor}
            onChange={(e) => setNewSpaceColor(e.target.value)}
            className="w-20 h-14 rounded-xl cursor-pointer"
          />
          <button 
            onClick={addSpace}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} /> إضافة مساحة
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map(space => (
            <div key={space.id} className="group relative bg-slate-50 p-6 rounded-[2.2rem] border-2 border-transparent hover:border-slate-200 transition-all">
              <div className="flex items-center justify-between flex-row-reverse mb-4">
                <div 
                  className="w-10 h-10 rounded-xl shadow-lg" 
                  style={{ backgroundColor: space.primaryColor }}
                />
                <button 
                  onClick={() => removeSpace(space.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h4 className="text-lg font-black text-slate-800 mb-1">{space.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مساحة عمل مخصصة</p>
            </div>
          ))}
          {spaces.length === 0 && (
            <div className="col-span-full py-10 text-center text-slate-300 font-bold italic border-2 border-dashed rounded-[2.2rem]">
              لا يوجد مساحات عمل مضافة حالياً
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
