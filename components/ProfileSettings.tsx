
import React, { useState } from 'react';
import { User } from '../types';
import { UserCog, ShieldCheck, Lock, User as UserIcon, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState(user.password || '');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (username.length < 3) {
      setMessage({ type: 'error', text: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' });
      return;
    }

    // التحقق من أن اسم المستخدم غير مأخوذ (إلا إذا كان للمستخدم الحالي)
    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    const isTaken = savedUsers.some((u: User) => u.username === username.toLowerCase().trim() && u.id !== user.id);
    
    // حماية حساب azoos
    if (user.username !== 'azoos' && username.toLowerCase().trim() === 'azoos') {
      setMessage({ type: 'error', text: 'اسم المستخدم هذا محجوز للنظام' });
      return;
    }

    if (isTaken) {
      setMessage({ type: 'error', text: 'اسم المستخدم هذا مأخوذ بالفعل، اختر اسماً آخر' });
      return;
    }

    const updatedUser: User = {
      ...user,
      fullName,
      username: username.toLowerCase().trim(),
      password: password
    };

    onUpdate(updatedUser);
    setMessage({ type: 'success', text: 'تم تحديث بيانات ملفك الشخصي بنجاح' });
    
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 text-right">
      <div className="mb-12">
        <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">إعدادات الحساب</h2>
        <p className="text-slate-500 font-bold">إدارة بيانات دخولك الشخصية وهويتك داخل النظام.</p>
      </div>

      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        {message && (
          <div className={`mb-10 p-6 rounded-[1.8rem] flex flex-row-reverse items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
            {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="font-black text-lg">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase mr-2 tracking-widest flex flex-row-reverse items-center gap-2">
                <UserIcon size={14} className="text-primary" /> الاسم الكامل
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-right text-lg transition-all"
                placeholder="اسمه كما سيظهر للجميع"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase mr-2 tracking-widest flex flex-row-reverse items-center gap-2">
                <ShieldCheck size={14} className="text-primary" /> اسم المستخدم (Username)
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={user.username === 'azoos'} // حماية اسم السوبر أدمن
                className={`w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-right text-lg transition-all ${user.username === 'azoos' ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="اسم المستخدم للدخول"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase mr-2 tracking-widest flex flex-row-reverse items-center gap-2">
              <Lock size={14} className="text-primary" /> كلمة المرور الجديدة
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary font-bold text-right text-lg transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="pt-6 border-t border-slate-50">
            <button 
              type="submit" 
              className="w-full md:w-auto px-16 py-6 bg-primary text-white rounded-2xl font-black shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-4"
            >
              <Save size={20} /> حفظ التغييرات الشخصية
            </button>
          </div>
        </form>

        <div className="mt-12 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-row-reverse items-center gap-6">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg"><UserCog size={32} /></div>
           <div className="text-right">
              <p className="text-sm font-black text-slate-800">صلاحيات حسابك: <span className="text-primary uppercase">{user.role}</span></p>
              <p className="text-xs font-bold text-slate-400 mt-1">أنت تنتمي لمساحة عمل: {user.spaceId === 'master_space' ? 'الإدارة العامة' : user.spaceId}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
