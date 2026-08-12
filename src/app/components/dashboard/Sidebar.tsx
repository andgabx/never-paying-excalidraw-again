import React from 'react';
import { Workspace, Tag } from '@/types';
import { COLOR_MAP } from '@/constants/theme';
import Logo from '../Logo';

interface SidebarProps {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  tags: Tag[];
  selectedSidebarTag: Tag | null;
  editingId: string | null;
  editName: string;
  onSelectWorkspace: (ws: Workspace) => void;
  onSetEditingId: (id: string | null) => void;
  onSetEditName: (name: string) => void;
  onRenameWorkspace: (id: string, name: string) => void;
  onSelectTag: (tag: Tag | null) => void;
  onOpenWorkspaceModal: () => void;
  onOpenTagModal: () => void;
  onEditTag: (tag: Tag) => void;
  onDropToWorkspace?: (e: React.DragEvent, workspaceId: string) => void;
}

export function Sidebar({
  workspaces, selectedWorkspace, tags, selectedSidebarTag,
  editingId, editName,
  onSelectWorkspace, onSetEditingId, onSetEditName, onRenameWorkspace,
  onSelectTag, onOpenWorkspaceModal, onOpenTagModal, onEditTag, onDropToWorkspace
}: SidebarProps) {
  return (
    <aside className="w-full md:w-[260px] bg-brand-4 text-brand-1 md:min-h-screen flex flex-col py-6 rounded-br-[40px] md:rounded-r-[40px] shadow-2xl z-10 border-r border-brand-3/20">
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 text-brand-1 flex items-center justify-center">
          <Logo className="w-full h-full" />
        </div>
        <h1 className="text-xl font-bold tracking-tight cursor-pointer" onClick={() => onSelectTag(null)}>
          CloudCanvas
        </h1>
      </div>
      
      <div className="px-6 mb-3 flex items-center justify-between group">
        <h2 className="text-[11px] font-bold text-brand-2 uppercase tracking-wider">Workspaces</h2>
        <button onClick={onOpenWorkspaceModal} className="text-brand-2 hover:text-brand-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Novo Workspace">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
      </div>
      
      <div className="flex-none px-3 mb-10">
        {workspaces.map(ws => (
          <div 
            key={ws.id}
            className={`group flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all mb-1 ${selectedWorkspace?.id === ws.id ? 'bg-brand-3/40 text-brand-1 font-bold shadow-inner' : 'hover:bg-brand-3/20 text-brand-2'}`}
            onClick={() => { if (editingId !== ws.id) onSelectWorkspace(ws); }}
            onDragOver={onDropToWorkspace ? e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('ring-2', 'ring-brand-2', 'bg-brand-3/30'); } : undefined}
            onDragLeave={onDropToWorkspace ? e => e.currentTarget.classList.remove('ring-2', 'ring-brand-2', 'bg-brand-3/30') : undefined}
            onDrop={onDropToWorkspace ? e => { e.preventDefault(); e.currentTarget.classList.remove('ring-2', 'ring-brand-2', 'bg-brand-3/30'); onDropToWorkspace(e, ws.id); } : undefined}
          >
            {editingId === ws.id ? (
              <input autoFocus value={editName} onClick={e => e.stopPropagation()} onChange={e => onSetEditName(e.target.value)} onBlur={() => onRenameWorkspace(ws.id, editName)} onKeyDown={e => { if (e.key === 'Enter') onRenameWorkspace(ws.id, editName); if (e.key === 'Escape') onSetEditingId(null); }} className="w-full bg-transparent outline-none font-bold text-brand-1 placeholder-brand-3" />
            ) : ( <span className="truncate flex-1 text-sm">{ws.name}</span> )}
            
            {selectedWorkspace?.id === ws.id && editingId !== ws.id && (
              <button onClick={(e) => { e.stopPropagation(); onSetEditingId(ws.id); onSetEditName(ws.name); }} className="text-brand-2 hover:text-brand-1 ml-2 opacity-0 hover:opacity-100 transition-opacity group">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedWorkspace && (
        <>
          <div className="px-6 mb-3 flex items-center justify-between group">
            <h2 className="text-[11px] font-bold text-brand-2 uppercase tracking-wider">Tags</h2>
            <button onClick={onOpenTagModal} className="text-brand-2 hover:text-brand-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Nova Tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3">
            {tags.map(tag => (
              <div 
                key={tag.id}
                className={`group/tag flex items-center gap-3 px-3 py-2.5 rounded-2xl cursor-pointer transition-all mb-1 ${selectedSidebarTag?.id === tag.id ? 'bg-brand-3/40 text-brand-1 font-bold' : 'hover:bg-brand-3/20 text-brand-2'}`}
                onClick={() => onSelectTag(selectedSidebarTag?.id === tag.id ? null : tag)}
              >
                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${COLOR_MAP[tag.color] || 'bg-brand-1'}`}></div>
                <span className="truncate flex-1 text-sm">{tag.name}</span>
                <button onClick={(e) => { e.stopPropagation(); onEditTag(tag); }} className="text-brand-2 hover:text-brand-1 opacity-0 group-hover/tag:opacity-100 transition-opacity">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
