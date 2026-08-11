'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type Note = {
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  updatedAt: string | Date;
};

export default function DashboardClient({ initialNotes }: { initialNotes: Note[] }) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleCreateNote = async () => {
    if (!newNoteName.trim()) return;
    const id = crypto.randomUUID();
    
    try {
      await axios.post('/api/notes', { id, name: newNoteName, data: {} });
      router.push(`/notes/${id}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }
    
    setNotes(prev => prev.map(n => n.id === id ? { ...n, name: editName } : n));
    setEditingId(null);

    await axios.put(`/api/notes/${id}`, { name: editName });
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMenuOpenId(null);
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    await axios.delete(`/api/notes/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center">
      <header className="w-full max-w-5xl flex items-center justify-between py-6 px-4 md:px-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          TLDraw Notes
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
        >
          + Nova Nota
        </button>
      </header>

      <main className="w-full max-w-5xl px-4 md:px-8 mt-8 flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-300">Suas anotações</h2>
        </div>

        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
            <p className="text-slate-400 mb-4">Você ainda não tem anotações.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 px-6 rounded-xl transition-colors"
            >
              Criar primeira nota
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {notes.map(note => (
              <div 
                key={note.id}
                onClick={() => {
                  if (editingId !== note.id) router.push(`/notes/${note.id}`);
                }}
                className="group relative bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl p-5 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between min-h-[160px]"
              >
                {editingId === note.id ? (
                  <input
                    autoFocus
                    value={editName}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={() => handleRename(note.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(note.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="w-full bg-transparent border-b border-blue-400 outline-none text-lg font-semibold text-white mb-2"
                  />
                ) : (
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                      {note.name}
                    </h3>
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === note.id ? null : note.id);
                        }}
                        className="text-slate-400 hover:text-white p-1 rounded transition-colors text-xl leading-none"
                        title="Opções"
                      >
                        &#8942;
                      </button>
                      
                      {menuOpenId === note.id && (
                        <div 
                          className="absolute top-full right-0 mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-xl p-1 w-40 z-20 flex flex-col gap-1"
                          onClick={e => e.stopPropagation()}
                        >
                          <button 
                            className="text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(null);
                              setEditName(note.name);
                              setEditingId(note.id);
                            }}
                          >
                            <span>✏️</span> Renomear
                          </button>
                          <button 
                            className="text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex items-center gap-2"
                            onClick={(e) => handleDelete(e, note.id)}
                          >
                            <span>🗑️</span> Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="text-xs text-slate-500 font-medium">
                  Atualizado: {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold mb-4 text-white">Criar Nova Nota</h3>
            <input 
              autoFocus
              type="text" 
              placeholder="Nome da anotação..." 
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all mb-6"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-300 font-medium hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateNote}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-2 rounded-xl transition-colors shadow-lg hover:shadow-blue-500/25"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
