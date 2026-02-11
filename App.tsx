
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalendarState, DayData, User, Task, Space, SystemSettings } from './types';
import DayModal from './components/DayModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import SpaceManagement from './components/SpaceManagement';
import Settings from './components/Settings';
import { 
  ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, 
  Users, Bell, Search, Plus, Paperclip, LogOut, ShieldAlert, Lock,
  CheckCircle, Clock, FileText, Info, AlertTriangle, TrendingUp, Building2, Download, Image as ImageIcon,
  Settings as SettingsIcon, ChevronDown, Save
} from 'lucide-react';

const App: React.FC = () => {
  // --- نظام الحماية من حذف البيانات (Persistence Shield) ---
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

  const [view, setView] = useState<'calendar' | 'admin' | 'projects' | 'notifications' | 'spaces' | 'settings'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpaceId, setActiveSpaceId] = useState<string>(user?.spaceId || 'master_space');
  const [isSaving, setIsSaving] = useState(false);

  // تحديث مساحة العمل النشطة عند دخول المستخدم
  useEffect(() => {
    if (user && activeSpaceId === 'master_space' && user.spaceId !== 'master_space') {
      setActiveSpaceId(user.spaceId);
    }
  }, [user]);

  // حفظ البيانات فقط عند حدوث تغيير حقيقي (Deep Watch)
  const firstUpdate = useRef(true);
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    
    // إظهار مؤشر الحفظ
    setIsSaving(true);
    localStorage.setItem('bs_calendar_data', JSON.stringify(allCalendarData));
    localStorage.setItem('bs_spaces', JSON.stringify(spaces));
    localStorage.setItem('bs_settings', JSON.stringify(settings));
    localStorage.setItem('bs_notifications', JSON.stringify(notifications));
    
    const timer = setTimeout(() => setIsSaving(false), 1000);
    return () => clearTimeout(timer);
  }, [allCalendarData, spaces, settings, notifications]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }, [settings.primaryColor]);

  const stats = useMemo(() => {
    if (!user) return { totalTasks: 0, completedTasks: 0, mediaCount: 0, daysActive: 0 };
    const targetId = activeSpaceId || user.spaceId;
    const spaceData = allCalendarData[targetId] || {};
    let total = 0, completed = 0, media = 0;
    Object.values(spaceData).forEach(day => {
      total += day.tasks.length;
      completed += day.tasks.filter(t => t.completed).length;
      media += day.media.length;
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

  const addNotification = (message: string) => {
    const newNotif = {
      id: Date.now().toString(),
      message,
      user: user?.fullName,
      spaceId: activeSpaceId || user?.spaceId,
      time: new Date().toLocaleTimeString('ar-SA'),
      date: new Date().toLocaleDateString('ar-SA')
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  if (!user) return <Login onLogin={handleLogin} settings={settings} />;

  const isSuperAdmin = user.role === 'super-admin';
  const currentSpaceName = spaces.find(s => s.id === activeSpaceId)?.name || (activeSpaceId === 'master_space' ? 'لوحة التحكم الرئيسية' : 'مساحة العمل');

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-800 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
      <style>{`
        :root { --primary-color: ${settings.primaryColor}; }
        .bg-primary { background-color: var(--primary-color); }
        .text-primary { color: var(--primary-color); }
        .border-primary { border-color: var(--primary-color); }
        .ring-primary { --tw-ring-color: var(--primary-color); }
      `}</style>

      {/* مؤشر الحفظ التلقائي */}
      {isSaving && (
        <div className="fixed bottom-8 left-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] animate-bounce text-xs font-black">
          <Save size={16} className="text-emerald-400" /> جاري حفظ التغييرات...
        </div>
      )}

      <aside className="w-80 bg-[#0f172a] flex flex-col p-8 space-y-10 z-10 shadow-2xl text-slate-400">
        <div className="flex items-center gap-4 px-2">
          <div className="w-14 h-14 bg-primary rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl">
            <LayoutGrid size={32} />
          </div>
          <div>
            <span className="text-2xl font-black text-white leading-tight block">Business</span>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Space Pro</span>
          </div>
        </div>

        <nav className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <button onClick={() => setView('calendar')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'calendar' ? 'bg-primary text-white shadow-xl shadow-indigo-600/40' : 'hover:bg-slate-800 hover:text-white'}`}>
            <CalendarIcon size={20} /> التقويم التفاعلي
          </button>
          <button onClick={() => setView('projects')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'projects' ? 'bg-primary text-white shadow-xl shadow-indigo-600/40' : 'hover:bg-slate-800 hover:text-white'}`}>
            <TrendingUp size={20} /> إحصائيات الأداء
          </button>
          <button onClick={() => setView('notifications')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'notifications' ? 'bg-primary text-white shadow-xl shadow-indigo-600/40' : 'hover:bg-slate-800 hover:text-white'}`}>
            <Bell size={20} /> سجل النشاطات
          </button>
          {(user.permissions.canManageUsers || isSuperAdmin) && (
            <button onClick={() => setView('admin')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'admin' ? 'bg-primary text-white shadow-xl shadow-indigo-600/40' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Users size={20} /> {isSuperAdmin ? 'إدارة الكل' : 'إدارة الفريق'}
            </button>
          )}
          {isSuperAdmin && (
            <button onClick={() => setView('settings')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${view === 'settings' ? 'bg-primary text-white shadow-xl shadow-indigo-600/40' : 'hover:bg-slate-800 hover:text-white'}`}>
              <SettingsIcon size={20} /> الإعدادات العامة
            </button>
          )}
        </nav>

        <div className="pt-6 border-t border-slate-800">
           <div className="bg-slate-800/50 rounded-[2rem] p-6 border border-slate-700/50">
              <div className="flex items-center gap-4 mb-5">
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} className="w-12 h-12 rounded-2xl bg-indigo-500/10" alt="avatar" />
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-sm font-black text-white truncate">{user.fullName}</p>
                  <p className="text-[10px] text-primary font-bold uppercase">{user.role}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl text-xs font-black transition-all">
                <LogOut size={16} /> تسجيل الخروج
              </button>
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-24 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-20">
          <div className="relative w-96 group">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في المهام والملاحظات..." 
              className="bg-slate-100 border-none rounded-[1.5rem] py-4 pr-14 pl-6 w-full text-sm font-bold outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white transition-all shadow-inner text-right"
            />
          </div>
          
          <div className="flex items-center gap-4">
             {isSuperAdmin ? (
               <div className="relative flex items-center gap-2">
                 <Building2 size={18} className="text-primary" />
                 <select 
                   value={activeSpaceId}
                   onChange={(e) => setActiveSpaceId(e.target.value)}
                   className="bg-slate-100 border-none rounded-xl py-2 px-4 pr-10 text-xs font-black text-slate-600 outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                 >
                   <option value="master_space">عرض: المساحة الرئيسية</option>
                   {spaces.map(s => (
                     <option key={s.id} value={s.id}>عرض: {s.name}</option>
                   ))}
                 </select>
                 <ChevronDown size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
               </div>
             ) : (
               <div className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-500">{currentSpaceName}</div>
             )}
          </div>
        </header>

        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {view === 'calendar' ? (
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div className="text-right">
                  <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">{currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}</h1>
                  <p className="text-lg text-slate-400 font-bold">إحصائية {currentSpaceName}: <span className="text-primary">{stats.completedTasks} مكتملة</span> من أصل {stats.totalTasks}</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-[2.2rem] shadow-2xl shadow-slate-200 border border-slate-100">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all"><ChevronRight size={24} /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-10 py-3 text-sm font-black text-slate-900 hover:bg-slate-100 rounded-2xl transition-all">اليوم</button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all"><ChevronLeft size={24} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-6">
                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
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
                      className={`relative flex flex-col p-6 bg-white aspect-square rounded-[2.8rem] border-2 transition-all duration-500 overflow-hidden group 
                        ${isMatch ? 'ring-4 ring-yellow-400 border-yellow-400 scale-105 z-20 shadow-2xl' : 'border-slate-50 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl'}`}
                    >
                      <span className="text-3xl font-black mb-auto text-slate-200 group-hover:text-slate-900 transition-colors">{date.getDate()}</span>
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {data.tasks.length > 0 && <div className={`w-2 h-2 rounded-full ${data.tasks.every(t => t.completed) ? 'bg-emerald-500' : 'bg-rose-500'}`} />}
                        {data.media.length > 0 && <div className="w-2 h-2 rounded-full bg-primary" />}
                        {data.notes.length > 10 && <div className="w-2 h-2 rounded-full bg-amber-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : view === 'projects' ? (
            <div className="max-w-6xl mx-auto py-8 text-right">
               <h2 className="text-5xl font-black text-slate-900 mb-12 tracking-tight">تحليل أداء {currentSpaceName}</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-6"><CheckCircle size={40} /></div>
                    <p className="text-4xl font-black text-slate-900">{stats.completedTasks}</p>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase">مهام مكتملة</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mb-6"><Clock size={40} /></div>
                    <p className="text-4xl font-black text-slate-900">{stats.totalTasks - stats.completedTasks}</p>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase">مهام معلقة</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-indigo-50 text-primary rounded-3xl flex items-center justify-center mb-6"><Paperclip size={40} /></div>
                    <p className="text-4xl font-black text-slate-900">{stats.mediaCount}</p>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase">ملفات مرفوعة</p>
                  </div>
                  <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6"><CalendarIcon size={40} /></div>
                    <p className="text-4xl font-black text-slate-900">{stats.daysActive}</p>
                    <p className="text-sm font-bold text-slate-400 mt-2 uppercase">أيام نشطة</p>
                  </div>
               </div>
               <div className="mt-12 bg-[#0f172a] p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1/2 h-full bg-primary/10 blur-[100px]"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-4">معدل الإنجاز الكلي</h3>
                    <div className="flex items-center gap-8 flex-row-reverse">
                       <div className="flex-1 h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="h-full bg-primary shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                            style={{width: `${stats.totalTasks ? (stats.completedTasks/stats.totalTasks)*100 : 0}%`}}
                          ></div>
                       </div>
                       <span className="text-5xl font-black text-primary">
                         {stats.totalTasks ? Math.round((stats.completedTasks/stats.totalTasks)*100) : 0}%
                       </span>
                    </div>
                  </div>
               </div>
            </div>
          ) : view === 'admin' ? (
            <UserManagement currentUser={user} isSuperAdmin={isSuperAdmin} />
          ) : view === 'settings' && isSuperAdmin ? (
            <Settings settings={settings} onUpdate={setSettings} onSpacesUpdate={setSpaces} />
          ) : (
            <div className="max-w-4xl mx-auto py-8 text-right">
               <h2 className="text-4xl font-black text-slate-900 mb-12">سجل النشاطات الأخير</h2>
               <div className="space-y-6">
                  {notifications.filter(n => isSuperAdmin || n.spaceId === (activeSpaceId || user.spaceId)).length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-300 font-black italic">
                      لا يوجد نشاطات مسجلة حالياً.
                    </div>
                  )}
                  {notifications.filter(n => isSuperAdmin || n.spaceId === (activeSpaceId || user.spaceId)).map(n => (
                    <div key={n.id} className="bg-white p-8 rounded-[2.2rem] border border-slate-100 shadow-xl flex flex-row-reverse items-center gap-6 group hover:border-primary transition-all">
                       <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-primary transition-all"><Info size={28} /></div>
                       <div className="flex-1">
                          <p className="text-lg font-bold text-slate-800">{n.message}</p>
                          <div className="flex flex-row-reverse items-center gap-3 mt-2">
                            <span className="text-[10px] font-black text-primary bg-indigo-50 px-3 py-1 rounded-full">{n.user}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{n.time} - {n.date}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
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
            addNotification(`قام ${user.fullName} بتحديث بيانات يوم ${new Date(d.id).toLocaleDateString('ar-SA')}`);
            setSelectedDate(null);
          }}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default App;
