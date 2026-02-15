import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalendarState, DayData, User, Task, Space, SystemSettings } from './types';
import DayModal from './components/DayModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import SpaceManagement from './components/SpaceManagement';
import Settings from './components/Settings';
import ProfileSettings from './components/ProfileSettings';
// استيراد مكون الإحصائيات الجديد
import Stats from './components/Stats'; 
// استيراد مكون سجل النشاطات الجديد
import ActivityLog from './components/ActivityLog';

import { 
  ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, 
  Users, Bell, Search, Plus, Paperclip, LogOut, ShieldCheck, Lock,
  CheckCircle, Clock, FileText, Info, AlertTriangle, TrendingUp, Building2, Download, Image as ImageIcon,
  Settings as SettingsIcon, ChevronDown, Save, UserCog, Palette, Languages, Sun, Moon, BarChart3, Layout
} from 'lucide-react';

// قاموس الترجمة
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
    mainSpace: "لوحة التحكم الرئيسية",
    today: "اليوم",
    completed: "مكتملة",
    tasks: "مهام",
    saving: "تم تأمين الحفظ",
    darkMode: "الوضع الداكن",
    lightMode: "الوضع المضيء"
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
    lightMode: "Light Mode"
  }
};

const roleInstructions: Record<string, { title: string, steps: string[], color: string }> = {
  'super-admin': {
    title: "صلاحيات السوبر أدمن (التحكم المطلق)",
    steps: [
      "يمكنك مراقبة كافة مساحات العمل وتعديل إعداداتها البرمجية.",
      "لديك الصلاحية لتحديد عدد المستخدمين الأقصى لكل مساحة عمل.",
      "يمكنك إضافة مدراء نظام (Admins) وتعيينهم في أي مساحة."
    ],
    color: "bg-rose-500"
  },
  'admin': {
    title: "إرشادات مدير النظام",
    steps: [
      "قم بإدارة فرق العمل والتأكد من توزيع المهام بشكل صحيح.",
      "يمكنك مراجعة تقارير الإنجاز لكافة الموظفين في النظام.",
      "لديك صلاحية الوصول لإعدادات المظهر العامة."
    ],
    color: "bg-amber-500"
  },
  'manager': {
    title: "دليل مدير المساحة",
    steps: [
      "أنت المسؤول عن إضافة وحذف أعضاء فريقك ضمن السعة المحددة لك.",
      "تابع مهام موظفيك اليومية وقم بتقييم الأداء من قسم الإحصائيات.",
      "يمكنك تخصيص لون المساحة الخاص بك لتمييزها عن البقية."
    ],
    color: "bg-indigo-500"
  },
  'employee': {
    title: "دليل العمل اليومي للموظف",
    steps: [
      "اضغط على اليوم الحالي لإضافة مهامك اليومية وملاحظاتك.",
      "قم برفع المرفقات والصور لتوثيق إنجازاتك بشكل مرئي.",
      "تأكد من وضع علامة (مكتمل) عند انتهاء أي مهمة لتظهر في التقارير."
    ],
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
    return saved ? JSON.parse(saved) : {
      primaryColor: '#4f46e5',
      brandName: 'Business Space Pro',
      allowUserSignup: false
    };
  });

  const [notifications, setNotifications] = useState<any[]>(() => {
    const saved = localStorage.getItem('bs_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const t = translations[lang];
  const isSuperAdmin = user?.role === 'super-admin';
  const [view, setView] = useState<'calendar' | 'admin' | 'projects' | 'notifications' | 'spaces' | 'settings' | 'profile' | 'stats'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpaceId, setActiveSpaceId] = useState<string>(user?.spaceId || 'master_space');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('bs_lang', lang);
  }, [lang]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('bs_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (user && activeSpaceId === 'master_space' && user.spaceId !== 'master_space' && !isSuperAdmin) {
      setActiveSpaceId(user.spaceId);
    }
  }, [user]);

  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setIsSaving(true);
    localStorage.setItem('bs_calendar_data', JSON.stringify(allCalendarData));
    localStorage.setItem('bs_spaces', JSON.stringify(spaces));
    localStorage.setItem('bs_users_data', JSON.stringify(users));
    localStorage.setItem('bs_settings', JSON.stringify(settings));
    localStorage.setItem('bs_notifications', JSON.stringify(notifications));
    const timer = setTimeout(() => setIsSaving(false), 1000);
    return () => clearTimeout(timer);
  }, [allCalendarData, spaces, users, settings, notifications]);

  const currentSpace = useMemo(() => spaces.find(s => s.id === activeSpaceId), [spaces, activeSpaceId]);
  useEffect(() => {
    const themeColor = currentSpace?.primaryColor || settings.primaryColor;
    document.documentElement.style.setProperty('--primary-color', themeColor);
  }, [currentSpace, settings.primaryColor]);

  const statsSummary = useMemo(() => {
    if (!user) return { totalTasks: 0, completedTasks: 0, mediaCount: 0, daysActive: 0 };
    const targetId = activeSpaceId || user.spaceId;
    const spaceData = allCalendarData[targetId] || {};
    let total = 0, completed = 0, media = 0;
    Object.values(spaceData).forEach(day => {
      total += day.tasks.length;
      completed += day.tasks.filter(t => t.completed).length;
      if (day.media) media += day.media.length;
    });
    return { totalTasks: total, completedTasks: completed, mediaCount: media, daysActive: Object.keys(spaceData).length };
  }, [allCalendarData, user, activeSpaceId]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setActiveSpaceId(loggedUser.spaceId);
    localStorage.setItem('bs_session', JSON.stringify(loggedUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bs_session');
    setView('calendar');
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = Array(firstDay).fill(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentDate]);

  const getDayData = (date: Date): DayData => {
    const id = date.toISOString().split('T')[0];
    const targetId = activeSpaceId || user?.spaceId || 'default';
    return (allCalendarData[targetId] && allCalendarData[targetId][id]) || { id, spaceId: targetId, notes: '', tasks: [], media: [] };
  };

  const InstructionBox = () => {
    if (!user) return null;
    const instr = roleInstructions[user.role] || roleInstructions['employee'];
    return (
      <div className={`mb-10 p-8 rounded-[2.5rem] border-2 border-dashed transition-all hover:border-primary/30 flex items-start gap-6 ${lang === 'ar' ? 'flex-row-reverse text-right' : 'text-left'} ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className={`w-14 h-14 ${instr.color} text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg animate-bounce-slow`}>
          <div className="flex items-center justify-center">
            <Info size={28} />
          </div>
        </div>
        <div className="flex-1">
          <h3 className={`text-xl font-black mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{instr.title}</h3>
          <ul className="space-y-2">
            {instr.steps.map((step, i) => (
              <li key={i} className={`text-sm font-bold flex items-center gap-3 ${lang === 'ar' ? 'flex-row-reverse' : ''} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${instr.color}`} />
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  if (!user) return <Login onLogin={handleLogin} settings={settings} />;

  const currentSpaceName = currentSpace?.name || (activeSpaceId === 'master_space' ? t.mainSpace : "Space");

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${darkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-[#f8fafc] text-slate-800'} overflow-hidden font-['IBM_Plex_Sans_Arabic']`}>
      <style>{`
        :root { --primary-color: ${currentSpace?.primaryColor || settings.primaryColor}; }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>

      {isSaving && (
        <div className="fixed bottom-8 left-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] text-xs font-black animate-pulse border border-slate-700">
          <ShieldCheck size={16} className="text-emerald-400" /> {t.saving}
        </div>
      )}

      {/* القائمة الجانبية */}
      <aside className={`w-80 flex flex-col p-8 space-y-10 z-10 shadow-2xl transition-colors duration-500 ${darkMode ? 'bg-[#1e293b] text-slate-400 border-l border-slate-700' : 'bg-[#0f172a] text-slate-400'}`}>
        <div className="flex items-center gap-4 px-2">
          <div className="w-14 h-14 bg-primary rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500">
            <LayoutGrid size={32} />
          </div>
          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <span className="text-2xl font-black text-white leading-tight block">{settings.brandName.split(' ')[0]}</span>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Space Pro</span>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-slate-700">
          <button onClick={() => setDarkMode(!darkMode)} className="flex-1 flex items-center justify-center py-2 rounded-xl hover:bg-slate-700 transition-all text-slate-300">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="flex-1 flex items-center justify-center py-2 rounded-xl hover:bg-slate-700 transition-all text-white font-bold text-xs">
            <Languages size={18} className="mr-1" /> {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>

        <nav className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          <button onClick={() => setView('calendar')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'calendar' ? 'bg-primary text-white shadow-xl' : 'hover:bg-slate-800 hover:text-white'}`}>
            <CalendarIcon size={20} /> {t.calendar}
          </button>
          
          <button onClick={() => setView('stats')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'stats' ? 'bg-primary text-white shadow-xl' : 'hover:bg-slate-800 hover:text-white'}`}>
            <BarChart3 size={20} /> {t.stats}
          </button>

          <button onClick={() => setView('notifications')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'notifications' ? 'bg-primary text-white shadow-xl' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Bell size={20} /> {t.activity}
          </button>
          
          <div className="pt-4 pb-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-6 opacity-50">Management</div>
          
          <button onClick={() => setView('profile')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'profile' ? 'bg-primary text-white shadow-xl' : 'hover:bg-slate-800 hover:text-white'}`}>
            <UserCog size={20} /> {t.profile}
          </button>

          {(isSuperAdmin || user.role === 'admin' || user.role === 'manager') && (
            <button onClick={() => setView('admin')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'admin' ? 'bg-primary text-white shadow-xl' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Users size={20} /> {t.admin}
            </button>
          )}

          {isSuperAdmin && (
            <button onClick={() => setView('spaces')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'spaces' ? 'bg-primary text-white shadow-xl' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Building2 size={20} /> {t.spaces}
            </button>
          )}

          {isSuperAdmin && (
            <button onClick={() => setView('settings')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'settings' ? 'bg-primary text-white shadow-xl' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Palette size={20} /> {t.settings}
            </button>
          )}
        </nav>

        <div className="pt-6 border-t border-slate-800">
           <div className={`rounded-[2rem] p-6 border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className={`flex items-center gap-4 mb-5 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} className="w-12 h-12 rounded-2xl bg-indigo-500/10" alt="avatar" />
                <div className={`flex-1 min-w-0 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  <p className="text-sm font-black text-white truncate">{user.fullName}</p>
                  <p className="text-[10px] text-primary font-bold uppercase">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black transition-all">
                <LogOut size={16} /> {t.logout}
              </button>
           </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className={`h-24 backdrop-blur-xl border-b flex items-center justify-between px-12 sticky top-0 z-20 transition-colors duration-500 ${darkMode ? 'bg-slate-900/70 border-slate-700 flex-row' : 'bg-white/70 border-slate-200 flex-row-reverse'}`}>
          <div className="relative w-96 group">
            <Search className={`absolute ${lang === 'ar' ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors`} size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.search} 
              className={`border-none rounded-[1.5rem] py-4 w-full text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 transition-all shadow-inner ${lang === 'ar' ? 'pr-14 pl-6 text-right' : 'pl-14 pr-6 text-left'} ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'}`}
            />
          </div>
          
          <div className="flex items-center gap-4">
              {isSuperAdmin ? (
                <div className={`relative flex items-center gap-2 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Building2 size={18} className="text-primary" />
                  <select 
                    value={activeSpaceId}
                    onChange={(e) => setActiveSpaceId(e.target.value)}
                    className={`border-none rounded-xl py-2 px-8 text-xs font-black outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <option value="master_space">{t.mainSpace}</option>
                    {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className={`px-4 py-2 rounded-xl text-xs font-black ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{currentSpaceName}</div>
              )}
          </div>
        </header>

        <div className={`flex-1 p-12 overflow-y-auto custom-scrollbar transition-colors duration-500 ${darkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
          {view === 'calendar' ? (
            <div className="max-w-7xl mx-auto">
              <InstructionBox />
              <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <h1 className={`text-6xl font-black mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {currentDate.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
                  </h1>
                  <p className="text-lg text-slate-400 font-bold">{currentSpaceName}: <span className="text-primary">{statsSummary.completedTasks} {t.completed}</span> / {statsSummary.totalTasks} {t.tasks}</p>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-[2.2rem] shadow-2xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 shadow-none' : 'bg-white border-slate-100'}`}>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (lang === 'ar' ? 1 : -1), 1))} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-all">
                    {lang === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                  </button>
                  <button onClick={() => setCurrentDate(new Date())} className={`px-10 py-3 text-sm font-black rounded-2xl transition-all ${darkMode ? 'text-white hover:bg-slate-700' : 'text-slate-900 hover:bg-slate-100'}`}>
                    {t.today}
                  </button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (lang === 'ar' ? -1 : 1), 1))} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl text-slate-600 dark:text-slate-300 transition-all">
                    {lang === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-6">
                {(lang === 'ar' ? ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'] : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map(day => (
                  <div key={day} className="pb-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{day}</div>
                ))}
                
                {daysInMonth.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="bg-transparent aspect-square" />;
                  const data = getDayData(date);
                  const isMatch = searchQuery && (data.notes.includes(searchQuery) || data.tasks.some(t => t.text.includes(searchQuery)));
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`relative flex flex-col p-6 aspect-square rounded-[2.8rem] border-2 transition-all duration-500 overflow-hidden group 
                        ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-primary/50' : 'bg-white border-slate-50 hover:border-primary/50'}
                        ${isMatch ? 'ring-4 ring-yellow-400 border-yellow-400 scale-105 z-20 shadow-2xl' : 'hover:-translate-y-2 hover:shadow-2xl'}`}
                    >
                      <span className={`text-3xl font-black mb-auto transition-colors ${darkMode ? 'text-slate-700 group-hover:text-white' : 'text-slate-200 group-hover:text-slate-900'}`}>{date.getDate()}</span>
                      <div className={`flex flex-wrap gap-1.5 mt-4 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                        {data.tasks.length > 0 && <div className={`w-2 h-2 rounded-full ${data.tasks.every(t => t.completed) ? 'bg-emerald-500' : 'bg-rose-500'}`} />}
                        {data.media && data.media.length > 0 && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : view === 'stats' ? (
            <Stats 
              calendarState={allCalendarData} 
              spaces={spaces} 
              users={users} 
            />
          ) : view === 'profile' ? (
            <ProfileSettings 
              user={user} 
              onUpdate={(updatedUser: User) => {
                setUser(updatedUser);
                const updatedUsersList = users.map(u => u.id === updatedUser.id ? updatedUser : u);
                setUsers(updatedUsersList);
                localStorage.setItem('bs_session', JSON.stringify(updatedUser));
                localStorage.setItem('bs_users_data', JSON.stringify(updatedUsersList));
              }} 
            />
          ) : view === 'admin' ? (
            <UserManagement currentUser={user} isSuperAdmin={isSuperAdmin} />
          ) : view === 'spaces' && isSuperAdmin ? (
            <SpaceManagement onUpdate={setSpaces} onUsersUpdate={setUsers} />
          ) : view === 'settings' && isSuperAdmin ? (
            <Settings settings={settings} onUpdate={setSettings} onSpacesUpdate={setSpaces} />
          ) : view === 'notifications' ? (
            <ActivityLog 
              calendarState={allCalendarData} 
              spaces={spaces} 
              users={users} 
            />
          ) : (
            <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
               <h2 className={`text-4xl font-black mb-12 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t.activity}</h2>
            </div>
          )}
        </div>
      </main>

      {selectedDate && (
        <DayModal
          date={selectedDate}
          data={getDayData(selectedDate)}
          onClose={() => setSelectedDate(null)}
          onSave={(d) => {
            const targetId = activeSpaceId || user.spaceId;
            setAllCalendarData(prev => ({
              ...prev,
              [targetId]: { ...(prev[targetId] || {}), [d.id]: d }
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
