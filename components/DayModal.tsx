
import React, { useState, useRef } from 'react';
import { DayData, Task, MediaFile, User } from '../types';
import { X, Plus, Check, Square, Paperclip, Sparkles, Loader2, Mic, Camera, Trash2, StopCircle, Video, FileText, Upload, CheckCircle } from 'lucide-react';
import MediaGallery from './MediaGallery';
import { getDailySummary } from '../services/geminiService';

interface DayModalProps {
  date: Date;
  data: DayData;
  onClose: () => void;
  onSave: (data: DayData) => void;
  currentUser: User;
}

const DayModal: React.FC<DayModalProps> = ({ date, data, onClose, onSave, currentUser }) => {
  const [notes, setNotes] = useState(data.notes);
  const [tasks, setTasks] = useState<Task[]>(data.tasks);
  const [media, setMedia] = useState<MediaFile[]>(data.media);
  const [newTask, setNewTask] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = currentUser.role === 'admin' || currentUser.role === 'super-admin' || currentUser.permissions.canEdit;

  const addTask = () => {
    if (!newTask.trim() || !canEdit) return;
    setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false }]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    if (!canEdit) return;
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isDone = !t.completed;
        return { 
          ...t, 
          completed: isDone,
          completedBy: isDone ? currentUser.fullName : undefined,
          completedAt: isDone ? new Date().toISOString() : undefined
        };
      }
      return t;
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        let type: 'image' | 'video' | 'audio' | 'file' = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';

        const newMedia: MediaFile = {
          id: 'up-' + Date.now() + Math.random(),
          type,
          name: file.name,
          url: ev.target?.result as string,
          createdAt: new Date().toISOString()
        };
        setMedia(prev => [...prev, newMedia]);
      };
      reader.readAsDataURL(file);
    });
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startVoiceRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (e) => {
          const newMedia: MediaFile = {
            id: 'v-' + Date.now(),
            type: 'audio',
            name: `تسجيل صوتي - ${new Date().toLocaleTimeString('ar-SA')}`,
            url: e.target?.result as string,
            createdAt: new Date().toISOString()
          };
          setMedia(prev => [...prev, newMedia]);
        };
        reader.readAsDataURL(blob);
        audioStream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) { alert("يرجى منح صلاحية الميكروفون"); }
  };

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      setShowCamera(true);
      setTimeout(() => { if (videoPreviewRef.current) videoPreviewRef.current.srcObject = s; }, 100);
    } catch (err) { alert("يرجى منح صلاحية الكاميرا"); }
  };

  const closeCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setShowCamera(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
        
        <div className="px-10 py-8 border-b border-slate-100 flex flex-row-reverse items-center justify-between bg-slate-50/50">
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{date.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
            <div className="flex flex-row-reverse items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Business Space Pro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-xl rounded-2xl transition-all border border-transparent hover:border-slate-100"><X size={24} className="text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar text-right">
          
          <section>
            <div className="flex flex-row-reverse items-center justify-between mb-6">
              <label className="text-sm font-black text-slate-800 flex flex-row-reverse items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><FileText size={18} /></div> ملاحظات العمل اليومية
              </label>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all" title="رفع أي ملف (PDF, Doc, Image, etc.)"><Upload size={20} /></button>
                <button onClick={isRecording ? () => mediaRecorderRef.current?.stop() : startVoiceRecording} className={`p-2.5 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white'}`}>{isRecording ? <StopCircle size={20} /> : <Mic size={20} />}</button>
                <button onClick={openCamera} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Camera size={20} /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
              </div>
            </div>
            <textarea readOnly={!canEdit} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-44 p-6 rounded-[2rem] bg-slate-50 border border-slate-200 focus:ring-8 focus:ring-indigo-500/5 focus:border-primary outline-none transition-all resize-none text-slate-700 font-bold text-lg leading-relaxed placeholder:text-slate-300 text-right" placeholder="سجل تفاصيل اليوم هنا..." />
          </section>

          <section>
            <label className="text-sm font-black text-slate-800 mb-6 flex flex-row-reverse items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle size={18} /></div> قائمة المهام والمتابعة
            </label>
            <div className="space-y-4">
              {tasks.length === 0 && <p className="text-center py-8 text-slate-300 italic font-bold">لا توجد مهام مسجلة لهذا اليوم</p>}
              {tasks.map(task => (
                <div key={task.id} className={`flex flex-col p-5 rounded-3xl border transition-all ${task.completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="flex flex-row-reverse items-center gap-4">
                    <button onClick={() => toggleTask(task.id)} className={`transition-all active:scale-90 ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-primary'}`}>
                      {task.completed ? <CheckCircle size={26} fill="currentColor" className="text-emerald-500 bg-white rounded-full" /> : <Square size={26} />}
                    </button>
                    <span className={`flex-1 text-base font-bold text-right ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.text}</span>
                    {canEdit && <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-slate-200 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>}
                  </div>
                  {task.completed && (
                    <div className="mt-3 ml-10 flex flex-row-reverse items-center justify-between text-[10px] font-black text-emerald-600/70 bg-white/50 p-2 rounded-xl border border-emerald-100/50">
                      <span>أنجزها: {task.completedBy}</span>
                      <span>{new Date(task.completedAt!).toLocaleTimeString('ar-SA')}</span>
                    </div>
                  )}
                </div>
              ))}
              {canEdit && (
                <div className="flex flex-row-reverse items-center mt-6 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
                  <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTask()} placeholder="اكتب مهمة جديدة..." className="flex-1 p-5 bg-transparent outline-none text-base font-bold text-right" />
                  <button onClick={addTask} className="p-5 bg-primary text-white hover:opacity-90 transition-all"><Plus size={28} /></button>
                </div>
              )}
            </div>
          </section>

          <section className="bg-[#1e293b] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent opacity-50"></div>
            <div className="relative z-10">
              <div className="flex flex-row-reverse items-center justify-between mb-6">
                <div className="flex flex-row-reverse items-center gap-3 font-black text-xl"><Sparkles className="text-yellow-400" /> تحليل الذكاء الاصطناعي (Gemini)</div>
                <button 
                  onClick={async () => { 
                    setIsSummarizing(true); 
                    const s = await getDailySummary({id: data.id, spaceId: data.spaceId, notes, tasks, media}); 
                    setAiInsight(s || ''); 
                    setIsSummarizing(false); 
                  }} 
                  disabled={isSummarizing} 
                  className="px-6 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-black transition-all hover:scale-105 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSummarizing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />} تحديث التحليل
                </button>
              </div>
              <div className="text-sm font-medium leading-relaxed bg-white/5 border border-white/10 p-6 rounded-2xl min-h-[100px] flex items-center justify-center italic text-slate-300 text-right">
                {aiInsight || "اضغط على زر التحديث للحصول على تحليل ذكي لأداء اليوم"}
              </div>
            </div>
          </section>

          <section>
             <label className="text-sm font-black text-slate-800 mb-6 flex flex-row-reverse items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Paperclip size={18} /></div> المرفقات والملفات ({media.length})
            </label>
            <MediaGallery media={media} onRemove={(id) => canEdit && setMedia(media.filter(m => m.id !== id))} />
          </section>

        </div>

        <div className="px-10 py-8 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-4 backdrop-blur-md">
          <button onClick={onClose} className="px-8 py-4 text-sm font-black text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">إلغاء</button>
          {canEdit && <button onClick={() => onSave({ id: data.id, spaceId: data.spaceId, notes, tasks, media })} className="px-12 py-4 text-sm font-black text-white bg-primary hover:opacity-90 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">حفظ التعديلات</button>}
        </div>
      </div>

      {showCamera && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-6 backdrop-blur-3xl">
          <div className="relative w-full max-w-2xl aspect-video rounded-[3rem] overflow-hidden border-8 border-white/10 shadow-2xl">
            <video ref={videoPreviewRef} autoPlay playsInline className="w-full h-full object-cover" />
            <button onClick={closeCamera} className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-red-500 rounded-2xl text-white backdrop-blur-md transition-all"><X size={24} /></button>
          </div>
          <button onClick={() => {
            if (!videoPreviewRef.current) return;
            const canvas = document.createElement('canvas');
            canvas.width = videoPreviewRef.current.videoWidth;
            canvas.height = videoPreviewRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoPreviewRef.current, 0, 0);
            const newMedia: MediaFile = {
              id: 'p-' + Date.now(),
              type: 'image',
              name: `لقطة - ${new Date().toLocaleTimeString('ar-SA')}`,
              url: canvas.toDataURL('image/jpeg'),
              createdAt: new Date().toISOString()
            };
            setMedia(prev => [...prev, newMedia]);
            closeCamera();
          }} className="mt-12 w-24 h-24 bg-white rounded-full border-[12px] border-white/20 flex items-center justify-center text-slate-900 shadow-2xl active:scale-90 transition-all group">
            <Camera size={38} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DayModal;
