/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react';
import { COLOR_MAP } from '@/constants/theme';
import { Tag, Workspace, Folder } from '@/types';

interface BaseModalProps {
  title: string;
  onClose: () => void;
  onSave: () => void;
  children: React.ReactNode;
}

export function BaseModal({ title, onClose, onSave, children }: BaseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-5/80 backdrop-blur-md p-4">
      <div className="bg-brand-4 border border-brand-3/30 rounded-[32px] shadow-2xl p-8 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-2xl font-black mb-6 text-brand-1">{title}</h3>
        {children}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-3 text-brand-2 font-bold hover:text-brand-1 transition-colors">Cancelar</button>
          <button onClick={onSave} className="bg-brand-2 hover:bg-brand-1 text-brand-5 font-bold px-7 py-3 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Salvar</button>
        </div>
      </div>
    </div>
  );
}

// ===================== Modals =====================

export function CreateWorkspaceModal({ newName, setNewName, onClose, onSave }: any) {
  return (
    <BaseModal title="Novo Workspace" onClose={onClose} onSave={onSave}>
      <input autoFocus type="text" placeholder="Nome..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave()} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-2xl px-5 py-4 text-brand-1 placeholder-brand-3 outline-none focus:border-brand-2 transition-all mb-5 font-bold" />
    </BaseModal>
  );
}

export function CreateFolderModal({ newName, setNewName, workspaces, modalWorkspaceId, setModalWorkspaceId, modalFolders, selectedFolderForNewNote, setSelectedFolderForNewNote, onClose, onSave }: any) {
  return (
    <BaseModal title="Nova Pasta" onClose={onClose} onSave={onSave}>
      <input autoFocus type="text" placeholder="Nome..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave()} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-2xl px-5 py-4 text-brand-1 placeholder-brand-3 outline-none focus:border-brand-2 transition-all mb-5 font-bold" />
      
      {workspaces.length > 0 && (
        <div className="mb-6">
          <label className="text-[11px] font-black text-brand-2 uppercase tracking-wider mb-2 block">Workspace</label>
          <select value={modalWorkspaceId} onChange={e => setModalWorkspaceId(e.target.value)} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-xl px-4 py-3 text-brand-1 outline-none focus:border-brand-2 transition-all font-bold text-sm appearance-none">
            {workspaces.map((ws: Workspace) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
          </select>
        </div>
      )}

      <div className="mb-6">
        <label className="text-[11px] font-black text-brand-2 uppercase tracking-wider mb-2 block">Pasta de Destino</label>
        <select value={selectedFolderForNewNote || ''} onChange={e => setSelectedFolderForNewNote(e.target.value || null)} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-xl px-4 py-3 text-brand-1 outline-none focus:border-brand-2 transition-all font-bold text-sm appearance-none">
          <option value="">Raiz do Workspace (Overview)</option>
          {modalFolders.map((f: Folder) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
    </BaseModal>
  );
}

export function CreateTagModal({ isOpen, onClose, newName, setNewName, newTagColor, setNewTagColor, modalWorkspaceId, setModalWorkspaceId, workspaces, onSave }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-brand-5/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-4 rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-brand-3/20">
        <h2 className="text-2xl font-bold mb-6 text-brand-1">Criar Tag</h2>
        
        <label className="block text-sm font-medium text-brand-2 mb-2">Nome da Tag</label>
        <input type="text" className="w-full bg-brand-5/50 border border-brand-3/30 rounded-2xl px-5 py-3.5 mb-5 focus:outline-none focus:ring-2 focus:ring-brand-2 transition-all placeholder:text-brand-3" placeholder="Ex: Importante" value={newName} onChange={e => setNewName?.(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && onSave?.()} />
        
        <label className="block text-sm font-medium text-brand-2 mb-2">Cor da Tag</label>
        <div className="flex gap-3 mb-5 flex-wrap">
          {Object.entries(COLOR_MAP).map(([colorKey, colorClass]) => (
            <button key={colorKey} onClick={() => setNewTagColor?.(colorKey)} className={`w-8 h-8 rounded-full shadow-sm transition-transform ${colorClass} ${newTagColor === colorKey ? 'ring-2 ring-brand-1 ring-offset-2 ring-offset-brand-4 scale-110' : 'hover:scale-110'}`} />
          ))}
        </div>

        <label className="block text-sm font-medium text-brand-2 mb-2">Workspace</label>
        <select className="w-full bg-brand-5/50 border border-brand-3/30 rounded-2xl px-5 py-3.5 mb-8 focus:outline-none focus:ring-2 focus:ring-brand-2 text-brand-1" value={modalWorkspaceId} onChange={e => setModalWorkspaceId?.(e.target.value)}>
          <option value="">Selecione o workspace...</option>
          {workspaces?.map((ws: Workspace) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
        </select>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 rounded-2xl text-brand-2 hover:bg-brand-3/10 transition-colors">Cancelar</button>
          <button onClick={onSave} className="px-6 py-2.5 bg-brand-1 text-brand-5 font-semibold rounded-2xl hover:bg-brand-2 transition-colors">Criar Tag</button>
        </div>
      </div>
    </div>
  );
}

export function UpdateTagModal({ isOpen, onClose, newName, setNewName, newTagColor, setNewTagColor, onSave, onDelete }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-brand-5/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-brand-4 rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-brand-3/20">
        <h2 className="text-2xl font-bold mb-6 text-brand-1">Editar Tag</h2>
        
        <label className="block text-sm font-medium text-brand-2 mb-2">Nome da Tag</label>
        <input type="text" className="w-full bg-brand-5/50 border border-brand-3/30 rounded-2xl px-5 py-3.5 mb-5 focus:outline-none focus:ring-2 focus:ring-brand-2 transition-all placeholder:text-brand-3" value={newName} onChange={e => setNewName?.(e.target.value)} autoFocus onKeyDown={e => e.key === 'Enter' && onSave?.()} />
        
        <label className="block text-sm font-medium text-brand-2 mb-2">Cor da Tag</label>
        <div className="flex gap-3 mb-8 flex-wrap">
          {Object.entries(COLOR_MAP).map(([colorKey, colorClass]) => (
            <button key={colorKey} onClick={() => setNewTagColor?.(colorKey)} className={`w-8 h-8 rounded-full shadow-sm transition-transform ${colorClass} ${newTagColor === colorKey ? 'ring-2 ring-brand-1 ring-offset-2 ring-offset-brand-4 scale-110' : 'hover:scale-110'}`} />
          ))}
        </div>

        <div className="flex justify-between items-center">
          <button onClick={onDelete} className="px-4 py-2.5 rounded-2xl text-red-400 hover:bg-red-400/10 transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Excluir
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-2xl text-brand-2 hover:bg-brand-3/10 transition-colors">Cancelar</button>
            <button onClick={onSave} className="px-6 py-2.5 bg-brand-1 text-brand-5 font-semibold rounded-2xl hover:bg-brand-2 transition-colors">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateNoteModal({ newName, setNewName, workspaces, modalWorkspaceId, setModalWorkspaceId, modalFolders, selectedFolderForNewNote, setSelectedFolderForNewNote, modalTags, selectedTagsForNewNote, toggleTagForNewNote, onClose, onSave }: any) {
  return (
    <BaseModal title="Nova Nota" onClose={onClose} onSave={onSave}>
      <input autoFocus type="text" placeholder="Nome..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave()} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-2xl px-5 py-4 text-brand-1 placeholder-brand-3 outline-none focus:border-brand-2 transition-all mb-5 font-bold" />
      
      {workspaces.length > 0 && (
        <div className="mb-6">
          <label className="text-[11px] font-black text-brand-2 uppercase tracking-wider mb-2 block">Workspace</label>
          <select value={modalWorkspaceId} onChange={e => setModalWorkspaceId(e.target.value)} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-xl px-4 py-3 text-brand-1 outline-none focus:border-brand-2 transition-all font-bold text-sm appearance-none">
            {workspaces.map((ws: Workspace) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
          </select>
        </div>
      )}

      <div className="mb-6">
        <label className="text-[11px] font-black text-brand-2 uppercase tracking-wider mb-2 block">Pasta de Destino</label>
        <select value={selectedFolderForNewNote || ''} onChange={e => setSelectedFolderForNewNote(e.target.value || null)} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-xl px-4 py-3 text-brand-1 outline-none focus:border-brand-2 transition-all font-bold text-sm appearance-none">
          <option value="">Raiz do Workspace (Overview)</option>
          {modalFolders.map((f: Folder) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {modalTags.length > 0 && (
        <div className="mb-6">
          <label className="text-[11px] font-black text-brand-2 uppercase tracking-wider mb-3 block">Tags</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
            {modalTags.map((tag: Tag) => {
              const isSelected = selectedTagsForNewNote.includes(tag.id);
              return (
                <button key={tag.id} onClick={() => toggleTagForNewNote(tag.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${isSelected ? 'border-brand-1 bg-brand-1 text-brand-5' : 'border-brand-3/50 bg-brand-4 text-brand-2 hover:border-brand-2'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${COLOR_MAP[tag.color]}`}></div>
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </BaseModal>
  );
}

export function EditTagsModal({ note, tags, selectedTagsForNewNote, toggleTagForNewNote, onClose, onSave }: { note: any, tags: any[], selectedTagsForNewNote: string[], toggleTagForNewNote: (id: string) => void, onClose: () => void, onSave: () => void }) {
  if (!note) return null;
  return (
    <BaseModal title="Editar Tags" onClose={onClose} onSave={onSave}>
      <p className="text-sm font-bold text-brand-2 mb-6">Nota: {note.name}</p>
      {tags.length > 0 && (
        <div className="mb-6">
          <label className="text-[11px] font-black text-brand-2 uppercase tracking-wider mb-3 block">Tags Disponíveis</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
            {tags.map((tag: Tag) => {
              const isSelected = selectedTagsForNewNote.includes(tag.id);
              return (
                <button key={tag.id} onClick={() => toggleTagForNewNote(tag.id)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border-2 ${isSelected ? 'border-brand-1 bg-brand-1 text-brand-5' : 'border-brand-3/50 bg-brand-4 text-brand-2 hover:border-brand-2'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${COLOR_MAP[tag.color]}`}></div>
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </BaseModal>
  );
}
export * from './ConfirmModal';
