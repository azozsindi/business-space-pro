
import React from 'react';
import { MediaFile } from '../types';
import { X, FileIcon, Film, Image as ImageIcon, Mic, Play, Download, ExternalLink } from 'lucide-react';

interface MediaGalleryProps {
  media: MediaFile[];
  onRemove: (id: string) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, onRemove }) => {
  if (media.length === 0) return (
    <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border-4 border-dashed border-slate-100 text-slate-300 font-black italic">
      لا توجد مرفقات لهذا اليوم.
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">
      {media.map((file) => (
        <div key={file.id} className="relative group rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all duration-500">
          <button onClick={() => onRemove(file.id)} className="absolute top-4 left-4 z-20 p-2.5 bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 active:scale-90"><X size={16} /></button>
          
          <div className="aspect-square flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {file.type === 'image' ? (
              <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : file.type === 'video' ? (
              <div className="flex flex-col items-center">
                 <Film size={48} className="text-indigo-400 mb-2" />
                 <span className="text-xs font-black text-slate-400">Video File</span>
              </div>
            ) : file.type === 'audio' ? (
              <div className="flex flex-col items-center p-8 w-full h-full justify-center bg-indigo-50/30">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-xl mb-4 group-hover:scale-110 transition-transform"><Mic size={32} /></div>
                <audio src={file.url} controls className="w-full h-10 opacity-60 hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="flex flex-col items-center p-8">
                <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-4 group-hover:rotate-12 transition-transform"><FileIcon size={32} /></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{file.name.split('.').pop()} Document</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
               <a href={file.url} download={file.name} className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-2xl scale-90 group-hover:scale-100"><Download size={24} /></a>
               <button onClick={() => window.open(file.url)} className="p-4 bg-white text-slate-900 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-2xl scale-90 group-hover:scale-100"><ExternalLink size={24} /></button>
            </div>
          </div>
          <div className="p-5 border-t border-slate-50 text-right">
            <p className="text-xs font-black text-slate-800 truncate" title={file.name}>{file.name}</p>
            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{file.type} • {new Date(file.createdAt).toLocaleDateString('ar-SA')}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
