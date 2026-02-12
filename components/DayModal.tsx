import React, { useState, useRef, useEffect } from 'react';
import { DayData, Task, MediaItem, User } from '../types';
import { 
  X, Plus, Trash2, CheckCircle2, Circle, FileText, 
  Paperclip, Save, Image as ImageIcon, Clock,
  Mic, Camera, StopCircle, Music, Play, Monitor
} from 'lucide-react';

interface DayModalProps {
  date: Date;
  data: DayData;
  onClose: () => void;
  onSave: (data: DayData) => void;
  currentUser: User;
}

const DayModal: React.FC<DayModalProps> = ({ date, data, onClose, onSave, currentUser }) => {
  // الحالات الأساسية (مع الحفاظ على بياناتك القديمة)
  const [localData, setLocalData] = useState<DayData>({
    ...data,
    tasks: data.tasks || [],
    media: data.media || [],
    notes: data.notes || ''
  });
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'media'>('tasks');
  const [newTask, setNewTask] = useState('');

  // حالات الوسائط المتعددة (الجديدة)
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // --- إدارة المهام (نفس منطقك القديم مع الحفاظ على التنسيق) ---
  const addTask = () => {
    if (!newTask.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      // @ts-ignore (للحفاظ على الحقول التي أضفتها أنت يدوياً)
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

  // --- منطق الكاميرا والصوت والملفات (الإضافات الجديدة) ---
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newItem: MediaItem = {
          id: Math.random().toString(36).substr(2, 9),
          type: type,
          url: reader.result as string,
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          date: new Date().toISOString()
        };
        setLocalData(prev => ({ ...prev, media: [...prev.media, newItem] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const newItem: MediaItem = {
            id: Date.now().toString(),
            type: 'audio',
            url: reader.result as string,
            name: `تسجيل صوّتي - ${new Date().toLocaleTimeString('ar-SA')}`,
            date: new Date().toISOString()
          };
          setLocalData(prev => ({ ...prev, media: [...prev.media, newItem] }));
        };
        reader.readAsDataURL(audioBlob);
      };
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) { alert("الميكروفون غير متاح"); }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { 
      alert("الكاميرا غير متاحة");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const photoUrl = canvas.toDataURL('image/png');
      const newItem: MediaItem = {
        id: Date.now().toString(),
        type: 'image',
        url: photoUrl,
        name: `لقطة كاميرا ${new Date().toLocaleTimeString('ar-SA')}`,
        date: new Date().toISOString()
      };
      setLocalData(prev => ({ ...prev, media: [...prev.media, newItem] }));
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setShowCamera(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 backdrop-blur-md bg-slate-900/60 transition-all">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[95vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300 text-right" dir="rtl">
        
        {/* الرأس - مع الحفاظ على ستايلك */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-row-reverse bg-slate-50/50 dark:bg-slate-800/50">
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-all">
            <X size={24} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white">
              {date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-sm font-bold text-primary mt-1 flex items-center gap-2 justify-end">
              <Clock size={14} /> سجل اليوميات لـ {currentUser.fullName}
            </p>
          </div>
        </div>

        {/* نظام التبويبات الجديد للتنظيم */}
        <div className="flex p-2 gap-2 bg-slate-100 dark:bg-slate-800 mx-8 mt-6 rounded-2xl">
          <button onClick={() => setActiveTab('tasks')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'tasks' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>المهام</button>
          <button onClick={() => setActiveTab('notes')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'notes' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>الملاحظات</button>
          <button onClick={() => setActiveTab('media')} className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'media' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}>الوسائط والمرفقات</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* محتوى المهام */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="ما هي مهمة العمل القادمة؟"
                  className="flex-1 bg-slate-100 dark:bg-slate-800 dark:text-white border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-primary"
                />
                <button onClick={addTask} className="bg-primary text-white p-4 rounded-2xl shadow-lg hover:scale-105 transition-all">
                  <Plus size={24} />
                </button>
              </div>

              <div className="space-y-3">
                {localData.tasks.map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${task.completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700 shadow-sm'}`}>
                    <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={18} /></button>
                    <div className="flex items-center gap-4 flex-row-reverse flex-1">
                      <button onClick={() => toggleTask(task.id)} className={task.completed ? 'text-emerald-500' : 'text-slate-300'}>
                        {task.completed ? <CheckCircle2 size={26} /> : <Circle size={26} />}
                      </button>
                      <div className="text-right">
                        <p className={`font-bold ${task.completed ? 'text-slate-400 line-through' : 'dark:text-white'}`}>{task.text}</p>
                        {/* @ts-ignore */}
                        <p className="text-[10px] font-black text-slate-400">بواسطة: {task.createdBy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* محتوى الملاحظات */}
          {activeTab === 'notes' && (
            <textarea 
              value={localData.notes}
              onChange={(e) => setLocalData({...localData, notes: e.target.value})}
              placeholder="اكتب ملاحظاتك التقنية العميقة هنا..."
              className="w-full h-64 bg-slate-50 dark:bg-slate-800 dark:text-white border-none rounded-[2rem] p-8 text-lg font-medium outline-none focus:ring-4 focus:ring-primary/5 transition-all resize-none"
            />
          )}

          {/* محتوى الوسائط (الجديد كلياً) */}
          {activeTab === 'media' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => document.getElementById('file-img')?.click()} className="flex flex-col items-center gap-2 p-6 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-3xl hover:scale-105 transition-all">
                  <ImageIcon size={30} /> <span className="text-xs font-black">صور</span>
                  <input id="file-img" type="file" hidden accept="image/*" multiple onChange={(e) => handleFileUpload(e, 'image')} />
                </button>
                <button onClick={showCamera ? capturePhoto : openCamera} className={`flex flex-col items-center gap-2 p-6 rounded-3xl transition-all ${showCamera ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'}`}>
                  <Camera size={30} /> <span className="text-xs font-black">{showCamera ? 'التقط' : 'كاميرا'}</span>
                </button>
                <button onClick={isRecording ? stopRecording : startRecording} className={`flex flex-col items-center gap-2 p-6 rounded-3xl transition-all ${isRecording ? 'bg-emerald-500 text-white animate-pulse' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'}`}>
                  {isRecording ? <StopCircle size={30} /> : <Mic size={30} />} <span className="text-xs font-black">صوت</span>
                </button>
                <button onClick={() => document.getElementById('file-doc')?.click()} className="flex flex-col items-center gap-2 p-6 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-3xl hover:scale-105 transition-all">
                  <Paperclip size={30} /> <span className="text-xs font-black">ملفات</span>
                  <input id="file-doc" type="file" hidden onChange={(e) => handleFileUpload(e, 'file')} />
                </button>
              </div>

              {showCamera && (
                <div className="relative rounded-[2rem] overflow-hidden bg-black aspect-video shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <button onClick={capturePhoto} className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 px-8 py-3 rounded-2xl font-black shadow-2xl">التقاط الصورة</button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {localData.media.map((item) => (
                  <div key={item.id} className="group relative bg-slate-50 dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700">
                    <button onClick={() => setLocalData({...localData, media: localData.media.filter(m => m.id !== item.id)})} className="absolute top-3 left-3 z-10 p-2 bg-rose-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    {item.type === 'image' ? (
                      <img src={item.url} className="w-full h-40 object-cover" alt="" />
                    ) : item.type === 'audio' ? (
                      <div className="h-40 flex flex-col items-center justify-center p-4 bg-emerald-500/5">
                        <Music className="text-emerald-500 mb-2" />
                        <audio src={item.url} controls className="w-full scale-75" />
                      </div>
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center p-4">
                        <FileText size={40} className="text-slate-400 mb-2" />
                        <span className="text-[10px] font-black dark:text-white truncate w-full text-center">{item.name}</span>
                        <a href={item.url} download={item.name} className="mt-2 text-[10px] bg-primary text-white px-3 py-1 rounded-full">تحميل</a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
          <button 
            onClick={() => onSave(localData)} 
            className="flex-1 bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save size={22} /> حفظ التغييرات والوسائط
          </button>
          <button onClick={onClose} className="px-10 py-5 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-2xl font-black border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition-all">إلغاء</button>
        </div>
      </div>
    </div>
  );
};

export default DayModal;
