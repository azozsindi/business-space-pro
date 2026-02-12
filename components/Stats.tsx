import React, { useMemo } from 'react';
import { CalendarState, Space, User } from '../types';
import { 
  BarChart3, CheckCircle2, Circle, FileText, 
  Image as ImageIcon, Mic, Paperclip, Users,
  TrendingUp, Layout, PieChart
} from 'lucide-react';

interface StatsProps {
  calendarState: CalendarState;
  spaces: Space[];
  users: User[];
}

const Stats: React.FC<StatsProps> = ({ calendarState, spaces, users }) => {
  
  // --- تحليل البيانات (Data Processing) ---
  const stats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let totalMediaCount = { image: 0, audio: 0, file: 0, video: 0 };
    const spacePerformance: { [key: string]: { total: number, done: number, name: string } } = {};

    // تهيئة بيانات المساحات
    spaces.forEach(s => {
      spacePerformance[s.id] = { total: 0, done: 0, name: s.name };
    });

    // مسح كافة الأيام في كل المساحات
    Object.entries(calendarState).forEach(([spaceId, days]) => {
      Object.values(days).forEach(day => {
        // حساب المهام
        if (day.tasks) {
          day.tasks.forEach(task => {
            totalTasks++;
            if (task.completed) completedTasks++;
            
            if (spacePerformance[spaceId]) {
              spacePerformance[spaceId].total++;
              if (task.completed) spacePerformance[spaceId].done++;
            }
          });
        }

        // حساب الوسائط
        if (day.media && Array.isArray(day.media)) {
          day.media.forEach(item => {
            // @ts-ignore
            if (totalMediaCount[item.type] !== undefined) {
              // @ts-ignore
              totalMediaCount[item.type]++;
            }
          });
        }
      });
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      totalTasks,
      completedTasks,
      completionRate,
      totalMedia: totalMediaCount,
      spacePerformance: Object.values(spacePerformance).filter(s => s.total > 0),
      totalUsers: users.length,
      totalSpaces: spaces.length
    };
  }, [calendarState, spaces, users]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 text-right p-4 md:p-8" dir="rtl">
      
      {/* القسم الأول: البطاقات العلوية (Quick Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          <TrendingUp className="text-primary mb-4" size={32} />
          <h4 className="text-slate-500 dark:text-slate-400 font-bold text-sm">نسبة الإنجاز الكلية</h4>
          <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">{stats.completionRate}%</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
            <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${stats.completionRate}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
          <CheckCircle2 className="text-emerald-500 mb-4" size={32} />
          <h4 className="text-slate-500 dark:text-slate-400 font-bold text-sm">مهام تم إتمامها</h4>
          <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">{stats.completedTasks}</p>
          <p className="text-xs font-bold text-emerald-500 mt-2">من أصل {stats.totalTasks} مهمة</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
          <Users className="text-indigo-500 mb-4" size={32} />
          <h4 className="text-slate-500 dark:text-slate-400 font-bold text-sm">فريق العمل</h4>
          <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">{stats.totalUsers}</p>
          <p className="text-xs font-bold text-indigo-500 mt-2">موزعين على {stats.totalSpaces} مساحة</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700">
          <Paperclip className="text-amber-500 mb-4" size={32} />
          <h4 className="text-slate-500 dark:text-slate-400 font-bold text-sm">إجمالي المرفقات</h4>
          <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">
            {stats.totalMedia.image + stats.totalMedia.audio + stats.totalMedia.file}
          </p>
          <p className="text-xs font-bold text-amber-500 mt-2">وسائط متعددة مؤرشفة</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* تحليل المساحات */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-10 flex-row-reverse">
            <h3 className="text-2xl font-black flex items-center gap-3 dark:text-white">
              <Layout className="text-primary" /> أداء مساحات العمل
            </h3>
          </div>
          
          <div className="space-y-8">
            {stats.spacePerformance.map((space, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-center flex-row-reverse">
                  <span className="font-black text-slate-700 dark:text-slate-200">{space.name}</span>
                  <span className="text-sm font-bold text-slate-400">
                    {space.done} مكتمل / {space.total} كلي
                  </span>
                </div>
                <div className="relative h-4 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
                  <div 
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-primary to-indigo-400 transition-all duration-1000"
                    style={{ width: `${Math.round((space.done / space.total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.spacePerformance.length === 0 && (
              <div className="text-center py-20 text-slate-300 font-bold italic">لا توجد بيانات كافية للتحليل حالياً</div>
            )}
          </div>
        </div>

        {/* تحليل الوسائط */}
        <div className="bg-white dark:bg-slate-800 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-700">
          <h3 className="text-2xl font-black mb-10 flex items-center gap-3 justify-end dark:text-white">
            <PieChart className="text-amber-500" /> توزيع المرفقات
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center gap-4 flex-row-reverse p-4 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-indigo-600 shadow-sm"><ImageIcon size={24} /></div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold text-slate-500">الصور واللقطات</p>
                <p className="text-xl font-black dark:text-white">{stats.totalMedia.image}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-row-reverse p-4 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-emerald-600 shadow-sm"><Mic size={24} /></div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold text-slate-500">التسجيلات الصوتية</p>
                <p className="text-xl font-black dark:text-white">{stats.totalMedia.audio}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-row-reverse p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-600 shadow-sm"><FileText size={24} /></div>
              <div className="flex-1 text-right">
                <p className="text-sm font-bold text-slate-500">المستندات والملفات</p>
                <p className="text-xl font-black dark:text-white">{stats.totalMedia.file}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
