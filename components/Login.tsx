
import React, { useState } from 'react';
import { LayoutGrid, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'azoos' && password === '0001000') {
      const adminUser: User = { 
        id: 'admin_azoos', 
        username: 'azoos', 
        fullName: 'azoos', 
        role: 'admin',
        permissions: { canEdit: true, canViewMedia: true, canViewTasks: true, canManageUsers: true }
      };
      onLogin(adminUser);
      return;
    }

    const savedUsers = JSON.parse(localStorage.getItem('bs_users') || '[]');
    const foundUser = savedUsers.find((u: any) => u.username === username && u.password === password);
    
    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 mb-6">
            <LayoutGrid size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Business Space</h1>
          <p className="text-slate-500 mt-2 font-medium">مرحباً بك في مساحتك المهنية</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 mr-1">اسم المستخدم</label>
            <div className="relative">
              <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="أدخل اسمك"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 mr-1">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
            دخول النظام
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-bold flex items-center justify-center gap-1">
            <Lock size={12} /> نظام مؤمن ومحمي بالكامل
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
