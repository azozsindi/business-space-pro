
import React, { useState, useMemo, useEffect } from 'react';
import { CalendarState, DayData, User, Task, Space } from './types';
import DayModal from './components/DayModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import SpaceManagement from './components/SpaceManagement';
import { 
  ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, 
  Users, Bell, Search, Plus, Paperclip, LogOut, ShieldAlert, Lock,
  CheckCircle, Clock, FileText, Info, AlertTriangle, TrendingUp, Building2
} from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'calendar' | 'admin' | 'projects' | 'notifications' | 'spaces'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [allCalendarData, setAllCalendarData] = useState<CalendarState>({});
  const [notifications, setNotifications] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);

  // Load and Sync Mock
  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem('bs_calendar_data');
      if (savedData) setAllCalendarData(JSON.parse(savedData));

      const savedSession = localStorage.getItem('bs_session');
      if (savedSession) setUser(JSON.parse(savedSession));

      const savedNotifs = localStorage.getItem('bs_notifications');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

      const savedSpaces = localStorage.getItem('bs_spaces');
      if (savedSpaces) setSpaces(JSON.parse(savedSpaces));
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  useEffect(() => {
    localStorage.setItem('bs_calendar_data', JSON.stringify(allCalendarData));
  }, [allCalendarData]);

  useEffect(() => {
    localStorage.setItem('bs_spaces', JSON.stringify(spaces));
  }, [spaces]);

  // Reminders Logic (Filtered by current user's space)
  const reminders = useMemo(() => {
    if (!user) return [];
    const list: { task: Task, date: string, daysLeft: number }[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    const spaceData = allCalendarData[user.spaceId] || {};

    Object.entries(spaceData).forEach(([dateStr, day]) => {
      const taskDate = new Date(dateStr);
      const diffTime = taskDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= 5) {
        day.tasks.forEach(t => {
          if (!t.completed) {
            list.push({ task: t, date: dateStr, daysLeft: diffDays });
          }
        });
      }
    });
    return list.sort((a,b) => a.daysLeft - b.daysLeft);
  }, [allCalendarData, user]);

  const addNotification = (type: string, message: string) => {
    const newNotif = {
      id: Date.now(),
      spaceId: user?.spaceId,
      type,
      message,
      user: user?.fullName,
      time: new Date().toLocaleTimeString('ar-SA'),
      date: new Date().toLocaleDateString('ar-SA')
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    localStorage.setItem('bs_session', JSON.stringify(loggedUser));
    addNotification('login', `قام الموظف ${loggedUser.fullName} بتسجيل الدخول`);
  };

  const handleLogout = () => {
    addNotification('logout', `قام الموظف ${user?.fullName} بالخروج من النظام`);
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
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });

  const handleSaveDay = (data: DayData) => {
    if (!user) return;
    setAllCalendarData(prev => ({
      ...prev,
      [user.spaceId]: {
        ...(prev[user.spaceId] || {}),
        [data.id]: data
      }
    }));
    addNotification('update', `تم تحديث بيانات العمل ليوم ${new Date(data.id).toLocaleDateString('ar-SA')}`);
    setSelectedDate(null);
  };

  const getDayData = (date: Date): DayData => {
    const id = date.toISOString().split('T')[0];
    const spaceId = user?.spaceId || 'default';
    return (allCalendarData[spaceId] && allCalendarData[spaceId][id]) || { id, spaceId, notes: '', tasks: [], media: [] };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const isSuperAdmin = user.role === 'super-admin';
  const canManageUsers = user.permissions.canManageUsers || isSuperAdmin;
  const currentSpaceName = spaces.find(s => s.id === user.spaceId)?.name || 'مساحة العمل الأساسية';

  return (
    <div className="min-h-screen flex bg-[#f1f5f9] text-slate-800 overflow-hidden font-['IBM_Plex_Sans_Arabic']">
      
      {/* Sidebar */}
      <aside className="w-80 bg-[#1e293b] flex flex-col p-8 space-y-10 z-10 shadow-2xl text-slate-300">
        <div className="flex items-center gap-4 px-2">
          <div className="w-14 h-14 bg-indigo-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 active:rotate-12 transition-all">
            <LayoutGrid size={32} />
          </div>
          <div>
            <span className="text-2xl font-black text-white leading-tight block">Business</span>
            <span className="text-sm font-bold text-indigo-400">Space Pro</span>
          </div>
        </div>

        {/* Space Indicator */}
        <div className="px-5 py-3 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center gap-3">
          <Building2 size={16} className="text-indigo-400" />
          <span className="text-xs font-black text-white truncate">{currentSpaceName}</span>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <button 
            onClick={() => setView('calendar')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <CalendarIcon size={20} /> التقويم التفاعلي
          </button>
          
          <button 
            onClick={() => setView('projects')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === 'projects' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <TrendingUp size={20} /> إدارة المشاريع
          </button>

          <button 
            onClick={() => setView('notifications')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === 'notifications' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Bell size={20} /> السجل الموحد
          </button>

          {canManageUsers && (
            <button 
              onClick={() => setView('admin')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Users size={20} /> إدارة الموظفين
            </button>
          )}

          {isSuperAdmin && (
            <button 
              onClick={() => setView('spaces')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black transition-all ${view === 'spaces' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <ShieldAlert size={20} /> إدارة مساحات العمل
            </button>
          )}

          {/* Reminders Widget */}
          {reminders.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-700 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-4 flex items-center gap-2">
                <Clock size={12} /> تذكيرات قادمة
              </p>
              {reminders.map((r, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 group transition-all cursor-pointer" onClick={() => setSelectedDate(new Date(r.date))}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${r.daysLeft === 0 ? 'bg-red-500 text-white' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      {r.daysLeft === 0 ? 'اليوم!' : `بقي ${r.daysLeft} أيام`}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{r.task.text}</p>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="pt-6 border-t border-slate-700">
          <div className="bg-slate-800/80 rounded-3xl p-6 border border-slate-700 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} alt="Avatar" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{user.fullName}</p>
                <p className="text-[10px] text-indigo-400 font-bold capitalize">{user.role.replace('-', ' ')}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl text-xs font-black transition-all">
              <LogOut size={16} /> خروج آمن
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-20">
          <div className="relative w-96 group">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="ابحث في هذه المساحة..." 
              className="bg-slate-100 border-none rounded-2xl py-4 pr-14 pl-6 w-full text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/5 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </header>

        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {view === 'calendar' ? (
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                  <h1 className="text-6xl font-black text-slate-900 mb-4 tracking-tighter">{monthName}</h1>
                  <p className="text-lg text-slate-500 font-medium">مساحة عمل مخصصة لـ <span className="text-indigo-600 font-black">{currentSpaceName}</span></p>
                </div>
                <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl border border-slate-100">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all"><ChevronRight size={24} /></button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-10 py-3 text-sm font-black text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">العودة لليوم</button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-4 hover:bg-slate-50 rounded-2xl text-slate-600 transition-all"><ChevronLeft size={24} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-6">
                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                  <div key={day} className="pb-6 text-center text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</div>
                ))}
                
                {daysInMonth.map((date, idx) => {
                  if (!date) return <div key={`empty-${idx}`} className="bg-transparent aspect-square" />;
                  
                  const data = getDayData(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  const currentDay = isToday(date);
                  const hasTasks = data.tasks.length > 0;
                  const allDone = hasTasks && data.tasks.every(t => t.completed);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`relative flex flex-col items-start p-6 bg-white aspect-square rounded-[2.5rem] border-2 transition-all duration-500 group overflow-hidden
                        ${currentDay ? 'border-indigo-500 bg-indigo-50/10 shadow-2xl scale-105 z-10' : 'border-slate-50 hover:border-indigo-200 hover:-translate-y-2'}
                        ${isSelected ? 'border-indigo-600 ring-4 ring-indigo-600/10' : ''}`}
                    >
                      <span className={`text-3xl font-black mb-auto ${currentDay ? 'text-indigo-600' : 'text-slate-300 group-hover:text-slate-900'}`}>{date.getDate()}</span>
                      <div className="w-full flex flex-wrap gap-2 mt-4">
                        {hasTasks && (
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black border ${allDone ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                             {data.tasks.filter(t => t.completed).length}/{data.tasks.length}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : view === 'admin' ? (
            <UserManagement currentUser={user} />
          ) : view === 'spaces' && isSuperAdmin ? (
            <SpaceManagement onSpacesUpdate={setSpaces} />
          ) : view === 'projects' ? (
            <div className="max-w-6xl mx-auto py-8 text-center">
               <h2 className="text-5xl font-black text-slate-900 mb-8">إحصائيات المساحة</h2>
               {/* Content for stats */}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto py-8">
               <h2 className="text-4xl font-black text-slate-900 mb-8">السجل الخاص بمساحتك</h2>
               <div className="space-y-4">
                  {notifications.filter(n => n.spaceId === user.spaceId).map(n => (
                    <div key={n.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                       <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400"><Info /></div>
                       <div className="flex-1">
                          <p className="text-base font-bold text-slate-800">{n.message}</p>
                          <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{n.user}</span>
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
          onSave={handleSaveDay}
          currentUser={user}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className={`bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group`}>
    <div className={`w-14 h-14 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-6`}>{icon}</div>
    <p className="text-sm font-black text-slate-400 uppercase mb-1">{title}</p>
    <p className="text-5xl font-black text-slate-900">{value}</p>
  </div>
);

export default App;
