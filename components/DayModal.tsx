import React, { useState, useEffect } from 'react';
import { DayData, Task, User } from '../types';
import { 
  X, Plus, Trash2, CheckCircle2, Circle, FileText, 
  Paperclip, Save, Image as ImageIcon, MessageSquare, Clock 
} from 'lucide-react';

interface DayModalProps {
  date: Date;
  data: DayData;
  onClose: () => void;
  onSave: (data: DayData) => void;
  currentUser: User;
}

const DayModal: React.FC<DayModalProps> = ({ date, data, onClose, onSave, currentUser }) => {
  const [localData, setLocalData] = useState<DayData>({
    ...data,
    tasks: data.tasks || [],
    media: data.media || []
  });
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      createdBy: currentUser.fullName,
      createdAt: new Date().toISOString()
    };
    setLocalData({ ...localData, tasks: [...localData.tasks, task] });
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setLocalData({
      ...localData,
      tasks: localData.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    });
  };

  const deleteTask = (id: string) => {
    setLocalData({
      ...localData,
      tasks: localData.tasks.filter(t => t.id !== id)
    });
  };

  const handleSave = () => {
    onSave(localData);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 backdrop-blur-md bg-slate-900/60 transition-all">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 text-right" dir="rtl">
        
        {/* رأس النافذة */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center flex-row-reverse bg-slate-50/50">
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-all">
            <X size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-800">
              {date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-sm font-bold text-primary mt-1 flex items-center gap-2 justify-end">
              <Clock size={14} /> سجل اليوميات لـ {currentUser.fullName}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
          
          {/* قسم الملاحظات الكبرى */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-row-reverse text-slate-800">
              <FileText size={20} className="text-primary" />
              <h3 className="font-black">ملاحظات اليوم</h3>
            </div>
            <textarea 
              value={localData.notes}
              onChange={(e) => setLocalData({...localData, notes: e.target.value})}
              placeholder="اكتب تفاصيل اليوم هنا..."
              className="w-full h-40 bg-slate-50 border-none rounded-[2rem] p-6 text-lg font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none text-right"
            />
          </div>

          {/* قسم المهام (To-Do List) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 flex-row-reverse text-slate-800">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <h3 className="font-black">قائمة المهام</h3>
            </div>
            
            <div className="flex gap-4">
              <input 
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="أضف مهمة جديدة واضغط Enter..."
                className="flex-1 bg-slate-100 border-none rounded-2xl py-4 px-6 font-bold outline-none focus:bg-white focus:ring-2 focus:ring-primary transition-all"
              />
              <button onClick={addTask} className="bg-primary text-white p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                <Plus size={24} />
              </button>
            </div>

            <div className="space-y-3">
              {localData.tasks.map(task => (
                <div key={task.id} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${task.completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-50 shadow-sm'}`}>
                  <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <div className="flex items-center gap-4 flex-row-reverse flex-1">
                    <button onClick={() => toggleTask(task.id)} className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                    </button>
                    <div className="text-right">
                      <p className={`font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.text}</p>
                      <p className="text-[10px] font-black text-slate-400">بواسطة: {task.createdBy}</p>
                    </div>
                  </div>
                </div>
              ))}
              {localData.tasks.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed rounded-[2rem] text-slate-300 font-bold italic">
                  لا توجد مهام مسجلة لهذا اليوم بعد
                </div>
              )}
            </div>
          </div>

          {/* قسم المرفقات (Media) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-row-reverse text-slate-800">
              <Paperclip size={20} className="text-indigo-500" />
              <h3 className="font-black">المرفقات والروابط</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 hover:bg-slate-50 hover:border-primary hover:text-primary transition-all group">
                <ImageIcon size={30} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black">أضف صورة</span>
              </button>
              {localData.media?.map((m, idx) => (
                <div key={idx} className="aspect-square bg-slate-100 rounded-[1.5rem] overflow-hidden relative group">
                  <img src={m} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <Trash2 size={20} className="text-white cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* أزرار الإجراءات */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button 
            onClick={handleSave} 
            className="flex-1 bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save size={22} /> حفظ التغييرات واليوميات
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-5 bg-white text-slate-500 rounded-2xl font-black border border-slate-200 hover:bg-slate-100 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default DayModal;
