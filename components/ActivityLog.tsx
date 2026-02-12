import React, { useMemo } from 'react';
import { CalendarState, Space, User } from '../types';
import { 
  Clock, CheckCircle2, PlusCircle, FileUp, 
  UserPlus, LogIn, MessageSquare, Tag
} from 'lucide-react';

interface ActivityLogProps {
  calendarState: CalendarState;
  spaces: Space[];
  users: User[];
}

const ActivityLog: React.FC<ActivityLogProps> = ({ calendarState, spaces, users }) => {
  
  // استخراج النشاطات من بيانات التقويم
  const activities = useMemo(() => {
    const list: any[] = [];

    Object.entries(calendarState).forEach(([spaceId, days]) => {
      const spaceName = spaces.find(s => s.id === spaceId)?.name || 'مساحة غير معروفة';
      
      Object.values(days).forEach(day => {
        // تتبع المهام
        day.tasks?.forEach(task => {
          if (task.completed) {
            list.push({
              id: `task-done-${task.id}`,
              type: 'completed',
              title: 'إتمام مهمة',
              description: task.text,
              date: day.id,
              space: spaceName,
              icon: <CheckCircle2 className="text-emerald-500" />,
              color: 'bg-emerald-50'
            });
          } else {
            list.push({
              id: `task-add-${task.id}`,
              type: 'added',
              title: 'إضافة مهمة جديدة',
              description: task.text,
              date: day.id,
              space: spaceName,
              icon: <PlusCircle className="text-blue-500" />,
              color: 'bg-blue-50'
            });
          }
        });

        // تتبع المرفقات
        day.media?.forEach((item, idx) => {
          list.push({
            id: `media-${day.id}-${idx}`,
            type: 'media',
            title: 'رفع ملف/وسائط',
            description: `تم إضافة مرفق في يوم ${day.id}`,
            date: day.id,
            space: spaceName,
            icon: <FileUp className="text-amber-500" />,
            color: 'bg-amber-50'
          });
        });

        // تتبع الملاحظات
        if (day.notes && day.notes.trim().length > 0) {
          list.push({
            id: `note-${day.id}`,
            type: 'note',
            title: 'تحديث ملاحظات',
            description: day.notes.substring(0, 50) + '...',
            date: day.id,
            space: spaceName,
            icon: <MessageSquare className="text-indigo-500" />,
            color: 'bg-indigo-50'
          });
        }
      });
    });

    // ترتيب النشاطات حسب التاريخ (الأحدث أولاً)
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
  }, [calendarState, spaces]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-8 text-right" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black flex items-center gap-3 dark:text-white">
          <Clock className="text-primary" size={32} /> سجل النشاطات الأخيرة
        </h2>
        <span className="bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-bold">
          آخر 20 إجراء
        </span>
      </div>

      <div className="relative border-r-2 border-slate-100 dark:border-slate-800 pr-8 mr-4 space-y-8">
        {activities.map((activity) => (
          <div key={activity.id} className="relative group">
            {/* الدائرة على الخط الزمني */}
            <div className={`absolute -right-[41px] top-0 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm transition-transform group-hover:scale-125 ${activity.type === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`} />
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all group-hover:shadow-md">
              <div className="flex items-center justify-between mb-3 flex-row-reverse">
                <div className="flex items-center gap-3 flex-row-reverse">
                  <div className={`p-2 rounded-xl ${activity.color} dark:bg-opacity-10`}>
                    {activity.icon}
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-white">{activity.title}</h4>
                </div>
                <span className="text-xs font-bold text-slate-400">{activity.date}</span>
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4 pr-11">
                {activity.description}
              </p>

              <div className="flex items-center gap-2 flex-row-reverse">
                <Tag size={14} className="text-slate-300" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  مساحة العمل: {activity.space}
                </span>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-400 font-bold">لا توجد نشاطات مسجلة حتى الآن</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
