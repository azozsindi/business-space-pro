import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalendarState, DayData, User, Task, Space, SystemSettings } from './types';
import { supabase } from './supabaseClient';
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
  Users, Bell, Search, Plus, Paperclip, LogOut, ShieldCheck, Lock,
  CheckCircle, Clock, FileText, Info, AlertTriangle, TrendingUp, Building2, Download, Image as ImageIcon,
  Settings as SettingsIcon, ChevronDown, Save, UserCog, Palette, Languages, Sun, Moon, BarChart3
} from 'lucide-react';

const translations = {
  ar: {
    calendar: "التقويم التفاعلي", stats: "إحصائيات الإنجاز", activity: "سجل النشاطات", profile: "ملفي الشخصي",
    admin: "إدارة الفريق", spaces: "إدارة المساحات", settings: "تخصيص النظام", logout: "تسجيل الخروج",
    search: "ابحث في المهام والملاحظات...", mainSpace: "لوحة التحكم الرئيسية", today: "اليوم",
    completed: "مكتملة", tasks: "مهام", saving: "تم تأمين الحفظ سحابياً", darkMode: "الوضع الداكن", lightMode: "الوضع المضيء"
  },
  en: {
    calendar: "Interactive Calendar", stats: "Performance Stats", activity: "Activity Log", profile: "My Profile",
    admin: "Team Management", spaces: "Space Management", settings: "System Settings", logout: "Logout",
    search: "Search tasks and notes...", mainSpace: "Main Dashboard", today: "Today",
    completed: "Completed", tasks: "Tasks", saving: "Cloud Saved", darkMode: "Dark Mode", lightMode: "Light Mode"
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
  // --- 1. States & Hooks ---
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

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('bs_settings');
    return saved ? JSON.parse(saved) : { primaryColor: '#4f46e5', brandName: 'Business Space Pro', allowUserSignup: false };
  });

  const [view, setView] = useState<'calendar' | 'admin' | 'notifications' | 'spaces' | 'settings' | 'profile' | 'stats'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpaceId, setActiveSpaceId] = useState<string>('master_space');
  const [isSaving, setIsSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'offline'>('online');

  // --- 2. Database Synchronization ---
  const refreshUsersList = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) throw error;
      if (data) {
        const formatted: User[] = data.map(u => ({
          id: u.id, username: u.username, fullName: u.full_name, role: u.role, 
          spaceId: u.space_id, isActive: u.is_active, password: u.password,
          permissions: { 
            canManageUsers: ['admin', 'super-admin', 'manager'].includes(u.role),
            canCreateSpaces: u.role === 'super-admin',
            canViewAllReports: u.role !== 'employee'
          }
        }));
        setUsers(formatted);
        setDbStatus('online');
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setDbStatus('offline');
    }
  };

  const fetchSpaces = async () => {
    try {
      const { data, error } = await supabase.from('spaces').select('*');
      if (!error && data) {
        setSpaces(data.map(s => ({ 
          id: s.id, 
          name: s.name, 
          primaryColor: s.primary_color, 
          createdAt: s.created_at 
        })));
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshUsersList();
    fetchSpaces();
  }, []);

  // --- 3. Effects & Handlers ---
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('bs_lang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('bs_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (user && activeSpaceId === 'master_space' && user.role !== 'super-admin') {
      setActiveSpaceId(user.spaceId);
    }
  }, [user]);

  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('bs_calendar_data', JSON.stringify(allCalendarData));
    localStorage.setItem('bs_settings', JSON.stringify(settings));
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [allCalendarData, settings]);

  const t = translations[lang];
  const isSuperAdmin = user?.role === 'super-admin';
  const currentSpace = useMemo(() => spaces.find(s => s.id === activeSpaceId), [spaces, activeSpaceId]);
  const currentSpaceName = currentSpace?.name || (activeSpaceId === 'master_space' ? t.mainSpace : "Space");

  const statsSummary = useMemo(() => {
    const targetSpace = allCalendarData[activeSpaceId] || {};
    let total = 0, completed = 0;
    Object.values(targetSpace).forEach(day => {
      total += day.tasks.length;
      completed += day.tasks.filter(tk => tk.completed).length;
    });
    return { total, completed };
  }, [allCalendarData, activeSpaceId]);

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
    return (allCalendarData[activeSpaceId] && allCalendarData[activeSpaceId][id]) || 
           { id, spaceId: activeSpaceId, notes: '', tasks: [], media: [] };
  };

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setActiveSpaceId(loggedUser.spaceId);
    localStorage.setItem('bs_session', JSON.stringify(loggedUser));
    refreshUsersList();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bs_session');
    setView('calendar');
  };

  if (!user) return <Login onLogin={handleLogin} settings={settings} />;

  return (
    <div className={`min-h-screen flex transition-colors duration-500 ${darkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-[#f8fafc] text-slate-800'} overflow-hidden font-sans`}>
      <style>{`
        :root { --primary-color: ${currentSpace?.primaryColor || settings.primaryColor}; }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
      `}</style>

      {/* Cloud Status Indicator */}
      {dbStatus === 'offline' && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-rose-500 text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 text-xs font-black animate-bounce">
          <AlertTriangle size={16} /> Connection Lost - Using Local Cache
        </div>
      )}

      {isSaving && (
        <div className="fixed bottom-8 left-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] text-xs font-black animate-pulse border border-slate-700">
          <ShieldCheck size={16} className="text-emerald-400" /> {t.saving}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-80 flex flex-col p-8 space-y-10 z-10 shadow-2xl transition-colors duration-500 ${darkMode ? 'bg-[#1e293b] border-l border-slate-700' : 'bg-[#0f172a]'}`}>
        <div className="flex items-center gap-4 px-2">
          <div className="w-14 h-14 bg-primary rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl">
            <LayoutGrid size={32} />
          </div>
          <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
            <span className="text-2xl font-black text-white leading-tight block">{settings.brandName}</span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Enterprise Pro</span>
          </div>
        </div>

        <div className="flex gap-2 p-1 bg-slate-800/50 rounded-2xl border border-slate-700">
          <button onClick={() => setDarkMode(!darkMode)} className="flex-1 flex items-center justify-center py-2 rounded-xl hover:bg-slate-700 transition-all text-slate-300">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="flex-1 flex items-center justify-center py-2 rounded-xl hover:bg-slate-700 transition-all text-white font-bold text-xs">
            <Languages size={18} className="mx-1" /> {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </div>

        <nav className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          <button onClick={() => setView('calendar')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'calendar' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <CalendarIcon size={20} /> {t.calendar}
          </button>
          <button onClick={() => setView('stats')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'stats' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <BarChart3 size={20} /> {t.stats}
          </button>
          <button onClick={() => setView('notifications')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'notifications' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Bell size={20} /> {t.activity}
          </button>
          
          <div className="pt-6 pb-2 text-[10px] font-black text-slate-600 uppercase tracking-widest px-6 opacity-50">Administration</div>
          
          <button onClick={() => setView('profile')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'profile' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <UserCog size={20} /> {t.profile}
          </button>

          {(isSuperAdmin || user.role === 'admin' || user.role === 'manager') && (
            <button onClick={() => { refreshUsersList(); setView('admin'); }} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'admin' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Users size={20} /> {t.admin}
            </button>
          )}

          {isSuperAdmin && (
            <>
              <button onClick={() => setView('spaces')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'spaces' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Building2 size={20} /> {t.spaces}
              </button>
              <button onClick={() => setView('settings')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'settings' ? 'bg-primary text-white shadow-xl' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <SettingsIcon size={20} /> {t.settings}
              </button>
            </>
          )}
        </nav>

        <div className="pt-6 border-t border-slate-800">
            <div className={`rounded-[2rem] p-6 border transition-colors ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-800/50 border-slate-700/50'}`}>
              <div className={`flex items-center gap-4 mb-5 ${lang === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} className="w-12 h-12 rounded-2xl bg-indigo-500/10" alt="avatar" />
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className={`h-24 backdrop-blur-xl border-b flex items-center justify-between px-12 z-20 transition-colors ${darkMode ? 'bg-slate-900/70 border-slate-700 flex-row' : 'bg-white/70 border-slate-200 flex-row-reverse'}`}>
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

        <div className={`flex-1 p-12 overflow-y-auto custom-scrollbar transition-colors ${darkMode ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
          {view === 'calendar' ? (
            <div className="max-w-7xl mx-auto">
              {/* Role Instruction Box */}
              <div className={`mb-10 p-8 rounded-[2.5rem] border-2 border-dashed flex items-start gap-6 ${lang === 'ar' ? 'flex-row-reverse text-right' : 'text-left'} ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className={`w-14 h-14 ${roleInstructions[user.role]?.color || 'bg-primary'} text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}><Info size={28} /></div>
                <div className="flex-1">
                  <h3 className="text-xl font-black mb-2">{roleInstructions[user.role]?.title}</h3>
                  <ul className="space-y-1">
                    {roleInstructions[user.role]?.steps.map((s, i) => (
                      <li key={i} className="text-sm font-bold text-slate-400 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Calendar Header */}
              <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 ${lang === 'ar' ? 'md:flex-row-reverse' : ''}`}>
                <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
                  <h1 className={`text-6xl font-black mb-4 tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {currentDate.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
                  </h1>
                  <p className="text-lg text-slate-400 font-bold">{currentSpaceName}: <span className="text-primary">{statsSummary.completed} {t.completed}</span> / {statsSummary.total} {t.tasks}</p>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-[2.2rem] shadow-2xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all">
                    {lang === 'ar' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                  </button>
                  <button onClick={() => setCurrentDate(new Date())} className={`px-10 py-3 text-sm font-black rounded-2xl transition-all ${darkMode ? 'text-white hover:bg-slate-700' : 'text-slate-900 hover:bg-slate-100'}`}>
                    {t.today}
                  </button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl transition-all">
                    {lang === 'ar' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-6">
                {(lang === 'ar' ? ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'] : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map(day => (
                  <div key={day} className="pb-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{day}</div>
                ))}
                
                {daysInMonth.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="bg-transparent aspect-square" />;
                  const data = getDayData(date);
                  const isMatch = searchQuery && (data.notes.includes(searchQuery) || data.tasks.some(tk => tk.text.includes(searchQuery)));
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`relative flex flex-col p-6 aspect-square rounded-[2.8rem] border-2 transition-all duration-500 overflow-hidden group 
                        ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-primary/50' : 'bg-white border-slate-100 hover:border-primary/50'}
                        ${isMatch ? 'ring-4 ring-yellow-400 border-yellow-400 scale-105 z-20 shadow-2xl' : 'hover:-translate-y-2 hover:shadow-2xl'}`}
                    >
                      <span className={`text-3xl font-black mb-auto transition-colors ${darkMode ? 'text-slate-700 group-hover:text-white' : 'text-slate-200 group-hover:text-slate-900'}`}>{date.getDate()}</span>
                      <div className={`flex flex-wrap gap-1.5 mt-4 ${lang === 'ar' ? 'justify-end' : 'justify-start'}`}>
                        {data.tasks.length > 0 && <div className={`w-2 h-2 rounded-full ${data.tasks.every(tk => tk.completed) ? 'bg-emerald-500' : 'bg-rose-500'}`} />}
                        {data.media && data.media.length > 0 && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : view === 'stats' ? (
            <Stats calendarState={allCalendarData} spaces={spaces} users={users} />
          ) : view === 'admin' ? (
            <UserManagement currentUser={user} isSuperAdmin={isSuperAdmin} usersList={users} onUsersChange={refreshUsersList} />
          ) : view === 'spaces' && isSuperAdmin ? (
            <SpaceManagement onUpdate={fetchSpaces} onUsersUpdate={refreshUsersList} />
          ) : view === 'settings' && isSuperAdmin ? (
            <Settings settings={settings} onUpdate={setSettings} onSpacesUpdate={fetchSpaces} />
          ) : view === 'profile' ? (
            <ProfileSettings user={user} onUpdate={(updated) => { setUser(updated); refreshUsersList(); }} />
          ) : (
            <ActivityLog />
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedDate && (
        <DayModal 
          date={selectedDate} 
          isOpen={!!selectedDate} 
          onClose={() => setSelectedDate(null)} 
          data={getDayData(selectedDate)} 
          onSave={(newData) => {
            setAllCalendarData(prev => ({
              ...prev,
              [activeSpaceId]: { ...prev[activeSpaceId], [newData.id]: newData }
            }));
            setSelectedDate(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
