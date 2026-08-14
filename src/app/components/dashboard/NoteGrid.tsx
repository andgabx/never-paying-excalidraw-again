import React, { useState } from 'react';
import { Note } from '@/types';
import { COLOR_MAP, GRADIENTS } from '@/constants/theme';
import { useRouter } from 'next/navigation';

export interface NoteGridProps {
  notes: Note[];
  isLoading?: boolean;
  editingId: string | null;
  editName: string;
  menuOpenId: string | null;
  onSetEditingId: (id: string | null) => void;
  onSetEditName: (name: string) => void;
  onSetMenuOpenId: (id: string | null) => void;
  onRenameNote: (id: string, name: string) => void;
  onDeleteNote: (e: React.MouseEvent, id: string) => void;
  onOpenEditTagsModal: (note: Note) => void;
  onDragStart: (e: React.DragEvent, id: string, type: 'folder' | 'note') => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkMove?: (ids: string[]) => void;
}

export function NoteGrid({
  notes, isLoading = false, editingId, editName, menuOpenId,
  onSetEditingId, onSetEditName, onSetMenuOpenId,
  onRenameNote, onDeleteNote, onOpenEditTagsModal, onDragStart,
  onBulkDelete, onBulkMove
}: NoteGridProps) {
  const router = useRouter();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-brand-2">Anotações</h3>
          <span className="bg-brand-4/60 text-brand-2 text-xs px-3 py-1 rounded-full font-bold">{notes.length}</span>
        </div>
        
        {notes.length > 0 && (
          <div className="flex items-center gap-2">
            {isSelectionMode ? (
              <>
                <span className="text-sm font-bold text-brand-3 mr-2">{selectedIds.length} selecionados</span>
                <button 
                  onClick={() => { if (onBulkMove && selectedIds.length > 0) onBulkMove(selectedIds); }}
                  disabled={selectedIds.length === 0}
                  className="bg-brand-4 hover:bg-brand-3/20 text-brand-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mover
                </button>
                <button 
                  onClick={() => { 
                    if (onBulkDelete && selectedIds.length > 0) {
                      onBulkDelete(selectedIds); 
                      setIsSelectionMode(false);
                      setSelectedIds([]);
                    }
                  }}
                  disabled={selectedIds.length === 0}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Excluir
                </button>
                <button 
                  onClick={() => { setIsSelectionMode(false); setSelectedIds([]); }}
                  className="bg-brand-4 hover:bg-brand-3/20 text-brand-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ml-1"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsSelectionMode(true)}
                className="bg-brand-4 hover:bg-brand-3/20 text-brand-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
              >
                Selecionar
              </button>
            )}
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-brand-4 rounded-[32px] overflow-hidden border border-brand-3/20 flex flex-col h-[220px]">
              <div className="h-28 bg-brand-3/10 animate-pulse relative p-4"></div>
              <div className="flex-1 bg-brand-4 -mt-6 rounded-t-3xl relative p-5 flex flex-col z-10">
                <div className="h-5 w-2/3 bg-brand-3/20 rounded-md animate-pulse mb-2"></div>
                <div className="h-3 w-1/3 bg-brand-3/10 rounded-md animate-pulse mt-1"></div>
                <div className="mt-auto flex items-center gap-1.5 pt-3">
                  <div className="w-3 h-3 rounded-full bg-brand-3/20 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-brand-3/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div className="p-20 border-2 border-dashed border-brand-4/60 rounded-[40px] text-center flex flex-col items-center bg-brand-4/20 backdrop-blur-sm">
          <p className="text-brand-3 font-bold text-lg">Nenhuma anotação encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {notes.map(note => {
            const gIdx = note.id.charCodeAt(0) % GRADIENTS.length;
            return (
              <div 
                key={note.id} draggable={!isSelectionMode} onDragStart={(e) => onDragStart(e, note.id, 'note')} 
                onClick={(e) => { 
                  if (isSelectionMode) {
                    e.preventDefault();
                    setSelectedIds(prev => prev.includes(note.id) ? prev.filter(id => id !== note.id) : [...prev, note.id]);
                  } else if (editingId !== note.id) {
                    router.push(`/notes/${note.id}`); 
                  }
                }}
                className={`group bg-brand-4 rounded-[32px] overflow-hidden border ${selectedIds.includes(note.id) ? 'border-brand-2 ring-4 ring-brand-2/50' : 'border-brand-3/20'} shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-[220px] transform hover:-translate-y-1.5`}
              >
                <div className={`h-28 ${note.thumbnail ? 'bg-brand-3/20' : `bg-gradient-to-br ${GRADIENTS[gIdx]}`} relative p-4 z-20`}>
                  {isSelectionMode && (
                    <div className="absolute top-4 left-4 z-30">
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${selectedIds.includes(note.id) ? 'bg-brand-2 border-brand-2' : 'bg-brand-5/60 border-brand-3/50 backdrop-blur-sm'}`}>
                        {selectedIds.includes(note.id) && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-5)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>}
                      </div>
                    </div>
                  )}
                  {note.thumbnail ? (
                    <img src={note.thumbnail} alt={note.name} className="absolute inset-0 object-cover w-full h-full" />
                  ) : (
                    <div className="absolute inset-0 bg-brand-5/10 mix-blend-overlay"></div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onSetMenuOpenId(menuOpenId === note.id ? null : note.id); }} className="absolute top-4 right-4 bg-brand-5/40 hover:bg-brand-5/60 backdrop-blur-md text-brand-1 p-2 rounded-full transition-colors z-10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                  </button>
                  {menuOpenId === note.id && (
                    <div className="absolute top-12 right-4 bg-brand-5 border border-brand-4 rounded-2xl shadow-2xl p-2 w-40 z-30">
                      <button className="w-full text-left px-3 py-2.5 text-sm font-semibold text-brand-2 hover:bg-brand-4/80 hover:text-brand-1 rounded-xl transition-colors" onClick={(e) => { e.stopPropagation(); onSetMenuOpenId(null); onSetEditName(note.name); onSetEditingId(note.id); }}>Renomear</button>
                      <button className="w-full text-left px-3 py-2.5 text-sm font-semibold text-brand-2 hover:bg-brand-4/80 hover:text-brand-1 rounded-xl transition-colors" onClick={(e) => { e.stopPropagation(); onSetMenuOpenId(null); onOpenEditTagsModal(note); }}>Editar Tags</button>
                      <button className="w-full text-left px-3 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-900/20 rounded-xl transition-colors" onClick={(e) => onDeleteNote(e, note.id)}>Excluir</button>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 bg-brand-4 -mt-6 rounded-t-3xl relative p-5 flex flex-col z-10">
                  {editingId === note.id ? (
                    <input autoFocus value={editName} onClick={e => e.stopPropagation()} onChange={e => onSetEditName(e.target.value)} onBlur={() => onRenameNote(note.id, editName)} onKeyDown={e => { if (e.key === 'Enter') onRenameNote(note.id, editName); if (e.key === 'Escape') onSetEditingId(null); }} className="w-full bg-transparent border-b border-brand-2/40 outline-none text-lg font-bold text-brand-1 mb-1" />
                  ) : (
                    <h3 className="text-lg font-bold text-brand-1 line-clamp-1 mb-1">{note.name}</h3>
                  )}
                  
                  <div className="text-[11px] text-brand-3 font-semibold uppercase tracking-wider">
                    {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                  </div>
                  
                  <div className="mt-auto flex items-center gap-1.5 pt-3">
                    {note.tags?.slice(0,4).map(tag => (
                      <div key={tag.id} title={tag.name} className={`w-3 h-3 rounded-full border border-brand-5/50 shadow-sm ${COLOR_MAP[tag.color] || 'bg-brand-1'}`}></div>
                    ))}
                    {note.tags?.length > 4 && <span className="text-[10px] font-bold text-brand-2 ml-1">+{note.tags.length - 4}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
