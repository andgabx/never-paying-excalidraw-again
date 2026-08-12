import React from 'react';
import { Folder } from '@/types';
import { FOLDER_COLORS, FOLDER_ICON_COLORS } from '@/constants/theme';

interface FolderGridProps {
  folders: Folder[];
  editingId: string | null;
  editName: string;
  onNavigateToFolder: (folder: Folder) => void;
  onSetEditingId: (id: string | null) => void;
  onSetEditName: (name: string) => void;
  onRenameFolder: (id: string, name: string) => void;
  onDragStart: (e: React.DragEvent, id: string, type: 'folder' | 'note') => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetFolderId: string) => void;
}

export function FolderGrid({
  folders, editingId, editName,
  onNavigateToFolder, onSetEditingId, onSetEditName, onRenameFolder,
  onDragStart, onDragOver, onDragLeave, onDrop
}: FolderGridProps) {
  if (folders.length === 0) return null;

  return (
    <div className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-xl font-bold text-brand-2">Pastas</h3>
        <span className="bg-brand-4/60 text-brand-2 text-xs px-3 py-1 rounded-full font-bold">{folders.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {folders.map(folder => {
          const cIdx = folder.id.charCodeAt(0) % FOLDER_COLORS.length;
          return (
            <div 
              key={folder.id} draggable onDragStart={(e) => onDragStart(e, folder.id, 'folder')} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, folder.id)}
              onClick={() => { if (editingId !== folder.id) onNavigateToFolder(folder); }}
              className={`group relative ${FOLDER_COLORS[cIdx]} border border-brand-3/20 rounded-[32px] p-5 h-36 flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-1.5 shadow-sm hover:shadow-md`}
            >
              <div className="flex justify-between items-start">
                <svg className={`w-10 h-10 fill-current ${FOLDER_ICON_COLORS[cIdx]} transition-colors`} viewBox="0 0 16 16">
                  <path d="M7,3V4.002h6V6h-1V5H3V6H2V3ZM2.0001,13H13l1-5.9996H2.0001Z"/>
                </svg>
                <button onClick={(e) => { e.stopPropagation(); onSetEditingId(folder.id); onSetEditName(folder.name); }} className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity text-brand-2 hover:text-brand-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
              </div>
              {editingId === folder.id ? (
                <input autoFocus value={editName} onClick={e => e.stopPropagation()} onChange={e => onSetEditName(e.target.value)} onBlur={() => onRenameFolder(folder.id, editName)} onKeyDown={e => { if (e.key === 'Enter') onRenameFolder(folder.id, editName); if (e.key === 'Escape') onSetEditingId(null); }} className="w-full bg-transparent border-b border-brand-2/50 outline-none text-sm font-bold text-brand-1" />
              ) : (
                <span className="font-bold truncate text-base text-brand-1 mt-auto">{folder.name}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
