import React, { useState, useEffect } from 'react';
import { Space, User } from '../types';
import { supabase } from '../supabaseClient'; // الربط مع سوبابيس
import { Building2, Plus, Trash2, X, Shield, User as UserIcon, Key, CheckCircle, Loader2 } from 'lucide-react';

interface SpaceManagementProps {
  onUpdate: (spaces: Space[]) => void;
  onUsersUpdate?: (users: User[]) => void; 
}

const SpaceManagement: React.FC<SpaceManagementProps> = ({ onUpdate, onUsersUpdate }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [managerUsername, setManagerUsername] = useState('');
  const [managerFullName, setManagerFullName] = useState('');
  const [managerPass, setManagerPass] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // جلب المساحات من سوبابيس عند التحميل
  const fetchSpaces = async () => {
    const { data, error } = await supabase.from('spaces').select('*');
    if (!error && data) {
      const formattedSpaces: Space[] = data.map(s => ({
        id: s.id,
        name: s.name,
        managerId: s.manager_id,
        primaryColor: s.primary_color,
        userLimit: s.user_limit,
        createdAt: s.created_at
      }));
      setSpaces(formattedSpaces);
      onUpdate(formattedSpaces);
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, []);

  const handleAddSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !managerUsername || !managerPass) return;
    setLoading(true);

    try {
      // 1. إنشاء المساحة في سوبابيس أولاً للحصول على ID
      const { data: spaceData, error: spaceError } = await supabase
        .from('spaces')
        .insert([{
          name: name,
          primary_color: '#4f46e5',
          user_limit: 10
        }])
        .select()
        .single();

      if (spaceError) throw spaceError;

      // 2. إنشاء حساب المدير وربطه بالمساحة الجديدة
      const { error: userError } = await supabase
        .from('profiles')
        .insert([{
          username: managerUsername.toLowerCase().trim(),
          full_name: managerFullName || managerUsername,
          password: managerPass,
          role: 'admin',
          space_id: spaceData.id,
          is_active: true
        }]);

      if (userError) throw userError;

      // تحديث الواجهة
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      resetForm();
      fetchSpaces(); // إعادة جلب البيانات لتحديث القائمة
      
    } catch (err: any) {
      alert("حدث خطأ أثناء الإنشاء: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSpace = async (id: string) => {
    if (window.confirm('⚠️ تحذير: حذف المساحة سيؤدي لحذف جميع الموظفين والبيانات المرتبطة بها نهائياً من السحابة. هل أنت متأكد؟')) {
      const { error } = await supabase.from('spaces').delete().eq('id', id);
      if (!error) {
        fetchSpaces();
      } else {
        alert("خطأ في الحذف: " + error.message);
      }
    }
  };

  const resetForm = () => {
    setName('');
    setManagerUsername('');
    setManagerFullName('');
    setManagerPass('');
    setShowAdd(false);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 animate-in fade-in duration-500" dir="rtl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 text-right">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">إدارة الفروع والمساحات (Cloud)</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold">يمكنك إنشاء فروع مستقلة وتعيين مدراء لها أونلاين.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-[1.8rem] font-black hover:scale-105 transition-all shadow-2xl shadow-primary/20"
        >
          <Plus size={20} /> إضافة فرع جديد
        </button>
      </div>

      {showSuccess && (
        <div className="mb-8 flex items-center justify-center gap-3 bg-emerald-500/10 text-emerald-500 p-4 rounded-2xl border border-emerald-500/20 font-black animate-bounce">
          <CheckCircle size={20} /> تم تفعيل الفرع والمدير على السحابة بنجاح
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {spaces.map(space => (
          <div key={space.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2.8rem] border border-slate-100 dark:border-slate-700 shadow-xl group hover:border-primary transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mt-16 transition-all group-hover:bg-primary/10"></div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                <Building2 size={24} />
              </div>
              <button onClick={() => deleteSpace(space.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 relative z-10 text-right">{space.name}</h3>
            <div className="flex items-center justify-start gap-2 text-[10px] text-slate-400 font-bold mb-6 opacity-60">
                <Shield size={12} className="text-primary" /> ID: {space.id}
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between flex-row-reverse">
               <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <UserIcon size={18} />
               </div>
               <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-black uppercase">تاريخ الانضمام</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(space.createdAt).toLocaleDateString('ar-SA')}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">تجهيز فرع جديد</h3>
                <button onClick={() => setShowAdd(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-2xl transition-all dark:text-white"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleAddSpace} className="space-y-6 text-right">
                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1">اسم النشاط التجاري</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-right dark:text-white" placeholder="مثلاً: فرع الرياض" required />
                </div>
                
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1">اسم المستخدم للمدير</label>
                  <input type="text" value={managerUsername} onChange={e => setManagerUsername(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-left dark:text-white" placeholder="admin_riyadh" required />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1">الاسم الكامل للمدير</label>
                  <input type="text" value={managerFullName} onChange={e => setManagerFullName(e.target.value)} className="w-full p-5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-right dark:text-white" placeholder="محمد العتيبي" required />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 mb-3 block mr-1">كلمة السر المؤقتة</label>
                  <div className="relative">
                    <Key className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" value={managerPass} onChange={e => setManagerPass(e.target.value)} className="w-full p-5 pr-12 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary font-bold text-left dark:text-white" placeholder="••••••••" required />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-6 bg-primary text-white rounded-2xl font-black hover:scale-[1.02] shadow-2xl shadow-primary/20 mt-4 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : 'تفعيل الفرع والمدير أونلاين'}
                </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SpaceManagement;
