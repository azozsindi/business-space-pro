import React, { useState } from 'react';
import { LayoutGrid, Lock, User as UserIcon, AlertCircle, ShieldX } from 'lucide-react';
import { User, SystemSettings } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  settings: SystemSettings;
}

const Login: React.FC<LoginProps> = ({ onLogin, settings }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. حالة السوبر أدمن (عزوز) - دخول مباشر بصلاحيات كاملة
    if (username === 'azoos' && password === '0001000') {
      const adminUser: User = { 
        id: 'super_admin_azoos', 
        username: 'azoos', 
        fullName: 'عزوز', 
        role: 'super-admin',
        spaceId: 'master_space',
        isActive: true, // السوبر أدمن دائماً نشط
        permissions: { 
          canEdit: true, 
          canViewMedia: true, 
          canViewTasks: true, 
          canManageUsers: true,
          canCreateSpaces: true 
        }
      };
      onLogin(adminUser);
      return;
    }

    // 2. جلب المستخدمين من التخزين المحلي (التأكد من استخدام المفتاح الصحيح)
    const savedUsers: User[] = JSON.parse(localStorage.getItem('bs_users_data') || '[]');
    
    // البحث عن المستخدم بمطابقة الاسم وكلمة المرور
    const foundUser = savedUsers.find((u) => u.username === username && u.password === password);
    
    if (foundUser) {
      // 3. التحقق من حالة تفعيل الحساب
      if (foundUser.isActive === false) {
        setError('عذراً، هذا الحساب معطل حالياً. يرجى مراجعة الإدارة.');
        return;
      }
      
      onLogin(foundUser);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10">
        <div className="flex flex-col items-center mb-10">
          <div 
            className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl mb-6 transition-transform hover:rotate-12" 
            style={{ backgroundColor: settings.primaryColor }}
          >
            <LayoutGrid size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{settings.brandName}</h1>
          <p className="text-slate-500 mt-2 font-medium">مرحباً بك في مساحتك المهنية</p>
        </div>

        {/* عرض الأخطاء */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold animate-in fade-in slide-in-from-top-2">
            {error.includes('معطل') ? <ShieldX size={20} /> : <AlertCircle size={20} />}
            <span className="flex-1 text-right">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 mr-2 block text-right">اسم المستخدم</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 outline-none font-bold text-right transition-all" 
              style={{ '--tw-ring-color': settings.primaryColor } as any} 
              placeholder="أدخل اسم المستخدم" 
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 mr-2 block text-right">كلمة المرور</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 outline-none font-bold text-right transition-all" 
              style={{ '--tw-ring-color': settings.primaryColor } as any} 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-5 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 hover:brightness-110 mt-4" 
            style={{ backgroundColor: settings.primaryColor }}
          >
            دخول النظام
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-bold">نظام الإدارة الذكي v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
