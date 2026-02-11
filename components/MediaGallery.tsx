
import React from 'react';
import { MediaFile } from '../types';
import { X, FileIcon, Film, Image as ImageIcon, Mic, Play, Download } from 'lucide-react';

interface MediaGalleryProps {
  media: MediaFile[];
  onRemove: (id: string) => void;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ media, onRemove }) => {
  if (media.length === 0) return (
    <div className="py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold italic">
      لا توجد ملفات مرفقة لهذا اليوم بعد.
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-6 mt-4">
      {media.map((file) => (
        <div key={file.id} className="relative group rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all">
          <button
            onClick={() => onRemove(file.id)}
            className="absolute top-3 left-3 z-10 p-2 bg-red-500/90 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <X size={16} />
          </button>
          
          <div className="aspect-video flex items-center justify-center bg-slate-50 relative overflow-hidden">
            {file.type === 'image' ? (
              <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : file.type === 'video' ? (
              <video src={file.url} className="w-full h-full object-cover" controls />
            ) : file.type === 'audio' ? (
              <div className="flex flex-col items-center p-6 w-full h-full justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-md mb-3 animate-pulse">
                  <Mic size={24} />
                </div>
                <audio src={file.url} controls className="w-full h-8 opacity-80" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileIcon className="text-slate-300 mb-2" size={40} />
              </div>
            )}
            
            <div className="absolute bottom-2 right-2 flex gap-1">
               <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase text-white shadow-sm ${file.type === 'audio' ? 'bg-indigo-500' : file.type === 'image' ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                 {file.type}
               </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-black text-slate-700 truncate w-32" title={file.name}>{file.name}</span>
            <a href={file.url} download={file.name} className="text-slate-300 hover:text-indigo-600 transition-colors">
              <Download size={14} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
