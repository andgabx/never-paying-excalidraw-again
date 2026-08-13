'use client';

import { useState } from 'react';
import { Tldraw, Editor, loadSnapshot } from 'tldraw';
import 'tldraw/tldraw.css';
import Link from 'next/link';
import axios from 'axios';

import { Note } from '@/types';

export default function NoteClient({ initialNote }: { initialNote: Note }) {
  const [note, setNote] = useState<Note>(initialNote);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(initialNote.updatedAt ? new Date(initialNote.updatedAt) : null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(initialNote.name);
  const [editor, setEditor] = useState<Editor | null>(null);


  const extractTextFromShapes = (shapes: any[]): string | null => {
    const textParts: string[] = [];
    for (const shape of shapes) {
      if (shape.props && typeof shape.props.text === 'string' && shape.props.text.trim().length > 0) {
        textParts.push(shape.props.text.trim());
      }
    }
    return textParts.length > 0 ? textParts.join('\n') : null;
  };

  const generateThumbnail = async (editor: Editor): Promise<string | null> => {
    try {
      const shapes = editor.getCurrentPageShapes();
      if (shapes.length === 0) return null;

      const { blob } = await editor.toImage(shapes, { format: 'png', background: true });
      if (!blob) return null;

      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Failed to generate thumbnail", e);
      return null;
    }
  };

  const handleSave = async (editor: Editor) => {
    setSaving(true);
    const snapshot = editor.store.getStoreSnapshot();
    const thumbnail = await generateThumbnail(editor);
    const extractedText = extractTextFromShapes(editor.getCurrentPageShapes()); // Add this

    try {
      await axios.put(`/api/notes/${note.id}`, { data: snapshot, thumbnail, extractedText }); // Include it here
      setLastSaved(new Date());
    } catch (error) { console.error(error); }
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
    } catch (error) { console.error(error); }
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Not saved yet';
    return `Salvo em ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col h-screen bg-brand-5">
      {/* onPointerDown e.preventDefault() prevents header clicks from stealing
          DOM focus away from the tldraw canvas — official tldraw SDK pattern.
          Exception: the rename <input> needs real focus, so we allow it there. */}
      <header
        className="flex items-center justify-between py-4 px-8 bg-brand-4 border-b border-brand-3/30 shadow-md z-10 relative"
        onPointerDown={(e) => {
          // Don't steal focus unless the user is clicking directly on an input
          if (!(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex items-center gap-6">
          <Link 
            href="/" 
            className="text-brand-2 hover:text-brand-1 bg-brand-3/40 hover:bg-brand-3/60 px-4 py-2 rounded-xl transition-colors font-bold text-sm"
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
              className="bg-transparent border-b-2 border-brand-3 text-brand-1 text-xl font-black outline-none"
            />
          ) : (
            <div 
              className="text-xl font-black text-brand-1 cursor-pointer flex items-center gap-2 group" 
              onClick={() => setIsEditingName(true)}
              title="Clique para renomear"
            >
              {note.name} <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
            </div>
          )}
        </div>
        <div className="text-xs uppercase tracking-wider text-brand-2 font-black">
          {saving ? 'Salvando...' : formatLastSaved(lastSaved)}
        </div>
      </header>
      
      <div className="flex-1 w-full relative z-0">
        <Tldraw 
          autoFocus
          onMount={(ed) => {
            // Delay ensures focus runs after all React effects settle.
            // editor.focus() is the correct tldraw API (not getContainer().focus())
            setTimeout(() => {
              ed.focus();
              // Ensure shortcuts are enabled — a stale localStorage value can disable them
              if (!ed.user.getAreKeyboardShortcutsEnabled()) {
                ed.user.updateUserPreferences({ areKeyboardShortcutsEnabled: true });
              }
            }, 50);
            setEditor(ed);

            
            if (note.data && Object.keys(note.data).length > 0) {
              try {
                if (note.data.document) {
                  // Old format (TLEditorSnapshot)
                  loadSnapshot(ed.store, note.data);
                } else {
                  // New format (TLStoreSnapshot)
                  ed.store.loadStoreSnapshot(note.data);
                }
              } catch (e) {
                console.error("Failed to load snapshot", e);
              }
            }
            
            // Auto-save when the user stops interacting
            let timeoutId: NodeJS.Timeout;
            ed.store.listen(() => {
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                handleSave(ed);
              }, 2000);
            });
          }}
        />
      </div>
    </div>
  );
}
