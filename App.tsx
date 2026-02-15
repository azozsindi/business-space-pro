import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalendarState, DayData, User, Task, Space, SystemSettings } from './types';
import DayModal from './components/DayModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import SpaceManagement from './components/SpaceManagement';
import Settings from './components/Settings';
import ProfileSettings from './components/ProfileSettings';
import Stats from './components/Stats'; 
import ActivityLog from './components/ActivityLog';

import { 
  ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, 
  Users, Bell, Search, Plus, Paperclip, LogOut, ShieldCheck,
  Building2, Image as ImageIcon,
  Settings as SettingsIcon, UserCog, Palette, Languages, Sun, Moon, BarChart3, Info
} from 'lucide-react';

// قاموس الترجمة المحدث لضمان تعريب كامل
const translations = {
  ar: {
    calendar: "التقويم التفاعلي",
    stats: "إحصائيات الإنجاز",
    activity: "سجل النشاطات",
    profile: "ملفي الشخصي",
    admin: "إدارة الفريق",
    spaces: "إدارة المساحات",
    settings: "تخصيص النظام",
    logout: "تسجيل الخروج",
    search: "ابحث في المهام والملاحظات...",
    mainSpace: "المساحة الرئيسية",
    today: "اليوم",
    completed: "مكتملة",
    tasks: "مهام",
    saving: "تم تأمين الحفظ",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع المضيء",
    management: "لوحة التحكم"
  },
  en: {
    calendar: "Interactive Calendar",
    stats: "Performance Stats",
    activity: "Activity Log",
    profile: "My Profile",
    admin: "Team Management",
    spaces: "Space Management",
    settings: "System Settings",
    logout: "Logout",
    search: "Search tasks and notes...",
    mainSpace: "Main Dashboard",
    today: "Today",
    completed: "Completed",
    tasks: "Tasks",
    saving: "Changes Saved",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    management: "Management"
  }
};

// إرشادات الأدوار باللغة العربية
const roleInstructions: Record<string, { title: string, steps: string[], color: string }> = {
  'super-admin': {
    title: "صلاحيات السوبر أدمن (عزوز)",
    steps: ["التحكم المطلق في كافة المساحات", "تعديل السعات الاستيعابية", "إدارة المستخدمين النشطين"],
    color: "bg-rose-500"
  },
  'admin': {
    title: "إرشادات مدير النظام",
    steps: ["مراقبة أداء الفرق", "مراجعة تقارير الإنجاز", "تخصيص المظهر العام"],
    color: "bg-amber-500"
  },
  'manager': {
    title: "دليل مدير المساحة",
    steps: ["إدارة أعضاء فريقك", "توزيع المهام اليومية", "متابعة إحصائيات المساحة"],
    color: "bg-indigo-500"
  },
  'employee': {
    title: "دليل الموظف",
    steps: ["إضافة المهام اليومية", "رفع المرفقات للتوثيق", "تحديث حالة الإنجاز"],
    color: "bg-emerald-500"
  }
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'ar' | 'en'>(() => (localStorage.getItem('bs_lang') as 'ar' | 'en') || 'ar');
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('bs_theme') === 'dark');
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bs_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [allCalendarData, setAllCalendarData] = useState<CalendarState>(() => {
    const saved = localStorage.getItem('bs_calendar_data');
    return saved ? JSON.parse(saved) : {};
  });

  const [spaces, setSpaces] = useState<Space[]>(() => {
    const saved = localStorage.getItem('bs_spaces');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bs_users_data'); 
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('bs_settings');
    return saved ? JSON.parse(saved) : { primaryColor: '#4f46e5', brandName: 'Business Space Pro' };
  });

  const [view, setView] = useState<'calendar' | 'admin' | 'spaces' | 'settings' | 'profile' | 'stats' | 'notifications'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpaceId, setActiveSpaceId] = useState<string>(user?.spaceId || 'master_space');
  const [isSaving, setIsSaving] = useState(false);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  // تطبيق الاتجاه والسمة
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('bs_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('bs_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // تطبيق الألوان ديناميكياً
  const currentSpace = useMemo(() => spaces.find(s => s.id === activeSpaceId), [spaces, activeSpaceId]);
  useEffect(() => {
    const themeColor = currentSpace?.primaryColor || settings.primaryColor;
    document.documentElement.style.setProperty('--primary-color', themeColor);
  }, [currentSpace, settings.primaryColor]);

  // تحديث البيانات تلقائياً
  useEffect(() => {
    if (user) {
      localStorage.setItem('bs_calendar_data', JSON.stringify(allCalendarData));
      localStorage.setItem('bs_spaces', JSON.stringify(spaces));
      localStorage.setItem('bs_settings', JSON.stringify(settings));
      setIsSaving(true);
      const timer = setTimeout(() => setIsSaving(false), 800);
      return () => clearTimeout(timer);
    }
  }, [allCalendarData, spaces, settings]);

  const refreshUsersList = () => {
    const saved = localStorage.getItem('bs_users_data');
    if (saved) setUsers(JSON.parse(saved));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bs_session');
    setView('calendar');
  };

  if (!user) return <Login onLogin={(u) => { setUser(u); setActiveSpaceId(u.spaceId); refreshUsersList(); }} settings={settings} />;

  const currentSpaceName = currentSpace?.name || (activeSpaceId === 'master_space' ? t.mainSpace : "Space");

  return (
    <div className={`min-h-screen flex ${isRTL ? 'flex-row' : 'flex-row-reverse'} transition-colors duration-500 ${darkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-[#f8fafc] text-slate-800'}`}>
      
      {/* التنسيقات العالمية */}
      <style>{`
        :root { --primary-color: ${currentSpace?.primaryColor || settings.primaryColor}; }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        .focus-ring:focus { ring-color: var(--primary-color); }
      `}</style>

      {/* مؤشر الحفظ */}
      {isSaving && (
        <div className={`fixed bottom-8 ${isRTL ? 'left-8' : 'right-8'} bg-slate-900/90 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] text-xs font-black animate-pulse border border-slate-700`}>
          <ShieldCheck size={16} className="text-emerald-400" /> {t.saving}
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className={`h-24 backdrop-blur-xl border-b flex items-center justify-between px-12 z-20 ${darkMode ? 'bg-slate-900/70 border-slate-700' : 'bg-white/70 border-slate-200'}`}>
          <div className="flex items-center gap-6">
            {user.role === 'super-admin' ? (
              <select 
                value={activeSpaceId} 
                onChange={(e) => setActiveSpaceId(e.target.value)}
                className={`border-none rounded-xl py-2 px-4 text-xs font-black outline-none cursor-pointer ${darkMode ? 'bg-slate-800' : 'bg-slate-100 text-slate-600'}`}
              >
                <option value="master_space">{t.mainSpace}</option>
                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            ) : (
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black">{currentSpaceName}</div>
            )}
          </div>

          <div className="relative w-96 group">
            <Search className={`absolute ${isRTL ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-400`} size={20} />
            <input 
              type="text" 
              placeholder={t.search} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-3 rounded-2xl outline-none font-bold text-sm transition-all ${isRTL ? 'pr-14 pl-6 text-right' : 'pl-14 pr-6 text-left'} ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100'}`} 
            />
          </div>
        </header>

        <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
          {/* هنا يتم تبديل المشاهد بناء على الـ View */}
          {view === 'calendar' && (
            /* كود التقويم الأصلي هنا */
            <div className="max-w-7xl mx-auto space-y-10">
               {/* التعليمات */}
               <div className={`p-8 rounded-[2.5rem] border-2 border-dashed flex items-center gap-6 ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'}`}>
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${roleInstructions[user.role]?.color || 'bg-primary'}`}>
                    <Info size={28} />
                 </div>
                 <div className="text-right">
                    <h3 className="text-xl font-black">{roleInstructions[user.role]?.title}</h3>
                    <p className="text-sm text-slate-400 font-bold">{roleInstructions[user.role]?.steps.join(' • ')}</p>
                 </div>
               </div>
               
               {/* رأس التقويم وأزرار التحكم */}
               <div className={`flex flex-col md:flex-row items-center justify-between gap-6 ${isRTL ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <h1 className="text-5xl font-black tracking-tighter">
                    {currentDate.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
                  </h1>
                  <div className={`flex items-center gap-2 p-2 rounded-2xl ${darkMode ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}`}>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-all"><ChevronRight size={24}/></button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 text-xs font-black">{t.today}</button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-primary/10 rounded-xl text-primary transition-all"><ChevronLeft size={24}/></button>
                  </div>
               </div>

               {/* شبكة التقويم (باقي الكود كما هو) */}
            </div>
          )}
          
          {/* ربط المكونات الأخرى */}
          {view === 'admin' && <UserManagement currentUser={user} isSuperAdmin={user.role === 'super-admin'} usersList={users} onUsersChange={refreshUsersList} />}
          {view === 'stats' && <Stats calendarState={allCalendarData} spaces={spaces} users={users} />}
          {view === 'profile' && <ProfileSettings user={user} onUpdate={(u) => { setUser(u); refreshUsersList(); }} />}
          {view === 'spaces' && <SpaceManagement />}
          {view === 'settings' && <Settings settings={settings} onUpdate={setSettings} onSpacesUpdate={setSpaces} />}
          {view === 'notifications' && <ActivityLog calendarState={allCalendarData} spaces={spaces} users={users} />}
        </div>
      </main>

      {/* القائمة الجانبية - تتغير جهتها بناء على اللغة */}
      <aside className={`w-80 flex flex-col p-8 space-y-8 z-10 transition-all duration-500 border-primary/20 ${darkMode ? 'bg-[#1e293b] border-x' : 'bg-[#0f172a] text-slate-400'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg"><LayoutGrid size={28} /></div>
          <div className="text-right">
            <span className="text-xl font-black text-white block">{settings.brandName}</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">المساحة الذكية</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'calendar', icon: CalendarIcon, label: t.calendar },
            { id: 'stats', icon: BarChart3, label: t.stats },
            { id: 'notifications', icon: Bell, label: t.activity },
            { id: 'profile', icon: UserCog, label: t.profile },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setView(item.id as any)} 
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === item.id ? 'bg-primary text-white shadow-xl' : 'hover:bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}

          {/* أزرار الإدارة */}
          <div className="pt-4 pb-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">{t.management}</div>
          {(user.role !== 'employee') && (
            <button onClick={() => setView('admin')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === 'admin' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
              <Users size={20} /> {t.admin}
            </button>
          )}
          {user.role === 'super-admin' && (
            <>
              <button onClick={() => setView('spaces')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === 'spaces' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                <Building2 size={20} /> {t.spaces}
              </button>
              <button onClick={() => setView('settings')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === 'settings' ? 'bg-primary text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                <Palette size={20} /> {t.settings}
              </button>
            </>
          )}
        </nav>

        {/* أسفل القائمة: اللغة والسمة والخروج */}
        <div className="space-y-4 pt-6 border-t border-slate-800">
          <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl">
             <button onClick={() => setDarkMode(!darkMode)} className="flex-1 py-2 rounded-xl hover:bg-slate-700 text-white flex justify-center">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
             <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="flex-1 py-2 rounded-xl hover:bg-slate-700 text-white font-black text-xs">{lang === 'ar' ? 'EN' : 'عربي'}</button>
          </div>
          <button onClick={handleLogout} className="w-full py-4 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2">
            <LogOut size={18} /> {t.logout}
          </button>
        </div>
      </aside>

      {/* المودال الخاص باليوم */}
      {selectedDate && (
        <DayModal
          date={selectedDate}
          data={allCalendarData[activeSpaceId]?.[selectedDate.toISOString().split('T')[0]] || { id: selectedDate.toISOString().split('T')[0], spaceId: activeSpaceId, notes: '', tasks: [], media: [] }}
          onClose={() => setSelectedDate(null)}
          onSave={(d) => {
            setAllCalendarData(prev => ({
              ...prev,
              [activeSpaceId]: { ...(prev[activeSpaceId] || {}), [d.id]: d }
            }));
            setSelectedDate(null);
          }}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default App;
