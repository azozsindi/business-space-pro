
import React from 'react';
import { SystemSettings, Space } from '../types';
import SpaceManagement from './SpaceManagement';
import { Palette, Building2, Layout, Sliders, Check, ShieldCheck } from 'lucide-react';

interface SettingsProps {
  settings: SystemSettings;
  onUpdate: (settings: SystemSettings) => void;
  onSpacesUpdate: (spaces: Space[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate, onSpacesUpdate }) => {
  const [activeTab, setActiveTab] = React.useState<'general' | 'spaces'>('general');

  const colorPresets = [
    { name: 'Business Blue', color: '#4f46e5' },
    { name: 'Executive Purple', color: '#9333ea' },
    { name: 'Emerald Success', color: '#059669' },
    { name: 'Midnight Executive', color: '#0f172a' },
    { name: 'Sunset Sales', color: '#e11d48' },
    { name: 'Deep Gold', color: '#b45309' },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 text-right">
      <div className="flex flex-row-reverse items-center justify-between mb-12">
        <div>
          <h2 className="text-5xl font-black text-slate-900 mb-2">لوحة التحكم العليا</h2>
          <p className="text-slate-500 font-bold">مرحباً عزوز، هنا يمكنك التحكم في هوية وبيئة النظام بالكامل.</p>
        </div>
      </div>

      <div className="flex flex-row-reverse gap-8">
        {/* Navigation Sidebar */}
        <div className="w-64 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex flex-row-reverse items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'general' ? 'bg-primary text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
          >
            <Palette size={20} /> المظهر العام
          </button>
          <button 
            onClick={() => setActiveTab('spaces')}
            className={`w-full flex flex-row-reverse items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'spaces' ? 'bg-primary text-white shadow-xl' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
          >
            <Building2 size={20} /> الفروع والمساحات
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100">
          {activeTab === 'general' ? (
            <div className="space-y-12">
              <section>
                <div className="flex flex-row-reverse items-center gap-4 mb-8">
                   <div className="p-3 bg-primary/10 text-primary rounded-2xl"><Palette size={24} /></div>
                   <h3 className="text-2xl font-black text-slate-800">تخصيص الهوية البصرية</h3>
                </div>
                
                <p className="text-sm font-bold text-slate-400 mb-6">اختر اللون الأساسي الذي سيعبر عن علامتك التجارية في جميع أنحاء التطبيق.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.color}
                      onClick={() => onUpdate({ ...settings, primaryColor: preset.color })}
                      className={`relative flex flex-row-reverse items-center gap-4 p-6 rounded-[2rem] border-2 transition-all ${settings.primaryColor === preset.color ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                      <div className="w-10 h-10 rounded-full shadow-lg" style={{ backgroundColor: preset.color }} />
                      <span className="text-sm font-black text-slate-700">{preset.name}</span>
                      {settings.primaryColor === preset.color && <div className="absolute top-4 left-4 text-primary"><Check size={16} /></div>}
                    </button>
                  ))}
                  
                  <div className="flex flex-row-reverse items-center gap-4 p-6 rounded-[2rem] border-2 border-dashed border-slate-200 group">
                    <input 
                      type="color" 
                      value={settings.primaryColor}
                      onChange={(e) => onUpdate({ ...settings, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-full cursor-pointer bg-transparent"
                    />
                    <span className="text-sm font-black text-slate-400">لون مخصص</span>
                  </div>
                </div>
              </section>

              <section className="pt-12 border-t border-slate-50">
                 <div className="flex flex-row-reverse items-center gap-4 mb-8">
                   <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><ShieldCheck size={24} /></div>
                   <h3 className="text-2xl font-black text-slate-800">إعدادات النظام</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-black text-slate-400 mb-3 block mr-1 uppercase">اسم المنصة الرسمي</label>
                    <input 
                      type="text" 
                      value={settings.brandName}
                      onChange={(e) => onUpdate({ ...settings, brandName: e.target.value })}
                      className="w-full max-w-md p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-right" 
                      placeholder="اسم النظام..." 
                    />
                  </div>
                  
                  <div className="flex flex-row-reverse items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 max-w-md">
                     <span className="text-sm font-black text-slate-700">تفعيل التسجيل المفتوح للمستخدمين</span>
                     <button 
                       onClick={() => onUpdate({ ...settings, allowUserSignup: !settings.allowUserSignup })}
                       className={`w-14 h-8 rounded-full transition-all relative ${settings.allowUserSignup ? 'bg-primary' : 'bg-slate-200'}`}
                     >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.allowUserSignup ? 'left-1' : 'right-1'}`} />
                     </button>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <SpaceManagement onSpacesUpdate={onSpacesUpdate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
