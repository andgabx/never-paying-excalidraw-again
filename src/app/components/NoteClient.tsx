'use client';

import { useState } from 'react';
import { Tldraw, Editor, getSnapshot, loadSnapshot } from 'tldraw';
import Link from 'next/link';
import axios from 'axios';

type Note = {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  updatedAt: string | Date;
};

export default function NoteClient({ initialNote }: { initialNote: Note }) {
  const [note, setNote] = useState<Note>(initialNote);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(initialNote.updatedAt ? new Date(initialNote.updatedAt) : null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(initialNote.name);

  const handleSave = async (editor: Editor) => {
    setSaving(true);
    const snapshot = getSnapshot(editor.store);
    try {
      await axios.put(`/api/notes/${note.id}`, { data: snapshot });
      setLastSaved(new Date());
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleRename = async () => {
    setIsEditingName(false);
    if (!newName.trim() || newName === note.name) {
      setNewName(note.name); // reset
      return;
    }
    
    setNote({...note, name: newName});
    try {
      await axios.put(`/api/notes/${note.id}`, { name: newName });
    } catch (e) {
      console.error(e);
    }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Not saved yet';
    return `Salvo em ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="flex items-center justify-between py-3 px-6 bg-slate-800 border-b border-slate-700 shadow-sm z-10 relative">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg transition-colors font-medium text-sm"
          >
            ← Voltar
          </Link>
          {isEditingName ? (
            <input 
              autoFocus
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              className="bg-transparent border-b border-dashed border-blue-400 text-white text-lg font-bold outline-none"
            />
          ) : (
            <div 
              className="text-lg font-bold text-white cursor-pointer flex items-center gap-2 group" 
              onClick={() => setIsEditingName(true)}
              title="Clique para renomear"
            >
              {note.name} <span className="text-sm opacity-50 group-hover:opacity-100 transition-opacity">✏️</span>
            </div>
          )}
        </div>
        <div className="text-sm text-slate-400 font-medium">
          {saving ? 'Salvando...' : formatLastSaved(lastSaved)}
        </div>
      </header>
      
      <div className="flex-1 w-full relative z-0">
        <Tldraw 
          onMount={(editor) => {
            if (note.data && note.data.document) {
              try {
                loadSnapshot(editor.store, note.data);
              } catch (e) {
                console.error("Failed to load snapshot", e);
              }
            }
            
            // Auto-save when the user stops interacting
            let timeoutId: NodeJS.Timeout;
            editor.store.listen(() => {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => handleSave(editor), 2000);
            });
          }}
        />
      </div>
    </div>
  );
}
