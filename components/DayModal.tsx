
import React, { useState, useRef, useEffect } from 'react';
import { DayData, Task, MediaFile, User } from '../types';
import { X, Plus, Check, Square, Paperclip, Sparkles, Loader2, Lock, Mic, Camera, Trash2, StopCircle, Video } from 'lucide-react';
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
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canEdit = currentUser.role === 'admin' || currentUser.permissions.canEdit;

  const addTask = () => {
    if (!newTask.trim() || !canEdit) return;
    setTasks([...tasks, { 
      id: Date.now().toString(), 
      text: newTask, 
      completed: false 
    }]);
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
            name: `ملاحظة صوتية - ${new Date().toLocaleTimeString('ar-SA')}`,
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
    } catch (err) {
      alert("يرجى منح صلاحية الميكروفون");
    }
  };

  const stopVoiceRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const capturePhoto = async () => {
    if (!videoPreviewRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoPreviewRef.current.videoWidth;
    canvas.height = videoPreviewRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoPreviewRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    
    const newMedia: MediaFile = {
      id: 'p-' + Date.now(),
      type: 'image',
      name: `لقطة حية - ${new Date().toLocaleTimeString('ar-SA')}`,
      url: dataUrl,
      createdAt: new Date().toISOString()
    };
    setMedia(prev => [...prev, newMedia]);
    closeCamera();
  };

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(s);
      setShowCamera(true);
      setTimeout(() => {
        if (videoPreviewRef.current) videoPreviewRef.current.srcObject = s;
      }, 100);
    } catch (err) {
      alert("يرجى منح صلاحية الكاميرا");
    }
  };

  const closeCamera = () => {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setShowCamera(false);
  };

  const handleAiSummary = async () => {
    setIsSummarizing(true);
    const summary = await getDailySummary({ id: data.id, notes, tasks, media });
    setAiInsight(summary || '');
    setIsSummarizing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] border border-white/20">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{date.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
            <p className="text-xs text-slate-500 font-bold mt-1">مساحة عمل: <span className="text-indigo-600">Business Space</span></p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white hover:shadow-md rounded-2xl transition-all"><X size={24} className="text-slate-400" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          
          {/* Notes Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                <FileText className="text-indigo-500" size={18} /> ملاحظات الفريق
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`p-2 rounded-xl transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                  title="تسجيل صوتي"
                >
                  {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                </button>
                <button 
                  onClick={openCamera}
                  className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                  title="تصوير حي"
                >
                  <Camera size={20} />
                </button>
              </div>
            </div>
            
            <textarea
              readOnly={!canEdit}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-40 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-slate-700 font-medium"
              placeholder="سجل ملاحظات العمل هنا..."
            />
          </section>

          {/* Tasks Section */}
          <section>
            <label className="text-sm font-black text-slate-700 mb-4 block">المهام اليومية</label>
            <div className="space-y-3">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex flex-col p-4 rounded-2xl border transition-all ${task.completed ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-white border-rose-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleTask(task.id)} 
                      className={`transition-transform active:scale-90 ${task.completed ? 'text-emerald-600' : 'text-rose-400'}`}
                    >
                      {task.completed ? <CheckCircle size={24} strokeWidth={3} /> : <Square size={24} />}
                    </button>
                    <span className={`flex-1 text-sm font-bold ${task.completed ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                      {task.text}
                    </span>
                    {canEdit && (
                      <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-slate-300 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  {task.completed && (
                    <div className="mt-2 mr-9 text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      تم الإنجاز بواسطة: {task.completedBy}
                    </div>
                  )}
                </div>
              ))}
              
              {canEdit && (
                <div className="flex items-center mt-6 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 group focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    placeholder="إضافة مهمة جديدة لفريقك..."
                    className="flex-1 p-4 bg-transparent outline-none text-sm font-bold"
                  />
                  <button onClick={addTask} className="p-4 bg-indigo-600 text-white hover:bg-indigo-700 transition-all"><Plus size={24} /></button>
                </div>
              )}
            </div>
          </section>

          {/* AI Section */}
          <section className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <Sparkles size={200} className="absolute -top-10 -left-10" />
            </div>
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2 font-black text-lg">
                <Sparkles size={22} className="text-yellow-300" /> رؤية ذكية (AI)
              </div>
              <button
                onClick={handleAiSummary}
                disabled={isSummarizing}
                className="px-5 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSummarizing ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                تحديث التحليل
              </button>
            </div>
            
            {aiInsight ? (
              <div className="text-sm font-medium leading-relaxed bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 relative z-10">
                {aiInsight}
              </div>
            ) : (
              <p className="text-xs text-white/60 font-bold text-center py-4 italic">اضغط على زر التحديث للحصول على رؤية ذكية لأداء هذا اليوم</p>
            )}
          </section>

          {/* Media Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-black text-slate-700 flex items-center gap-2">
                <Paperclip className="text-indigo-500" size={18} /> المعرض والمرفقات
              </label>
            </div>
            <MediaGallery media={media} onRemove={(id) => canEdit && setMedia(media.filter(m => m.id !== id))} />
          </section>

        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 text-sm font-black text-slate-500 hover:bg-slate-200 rounded-2xl transition-all">إلغاء</button>
          {canEdit && <button onClick={() => onSave({ id: data.id, notes, tasks, media })} className="px-10 py-3 text-sm font-black text-white bg-slate-900 hover:bg-black rounded-2xl shadow-xl transition-all active:scale-95">حفظ وتعميم التغييرات</button>}
        </div>
      </div>

      {/* Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-6 backdrop-blur-xl">
          <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden border-4 border-white/20 bg-slate-900">
            <video ref={videoPreviewRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 flex gap-2">
               <button onClick={closeCamera} className="p-3 bg-white/10 hover:bg-red-500 rounded-full text-white backdrop-blur-md transition-all"><X size={20} /></button>
            </div>
          </div>
          <div className="mt-8 flex gap-6">
            <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-white/20 flex items-center justify-center text-slate-900 shadow-2xl active:scale-90 transition-all">
              <Camera size={32} />
            </button>
          </div>
          <p className="mt-4 text-white/60 font-bold text-sm">اضغط على الكاميرا لالتقاط لقطة فورية</p>
        </div>
      )}
    </div>
  );
};

const FileText = ({ className, size }: { className?: string, size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const CheckCircle = ({ className, size, strokeWidth }: { className?: string, size?: number, strokeWidth?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

export default DayModal;
