'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

type Workspace = {
  id: string;
  name: string;
};

type Folder = {
  id: string;
  name: string;
  workspaceId: string;
  parentId: string | null;
};

type Note = {
  id: string;
  name: string;
  folderId: string | null;
  workspaceId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

import Logo from './Logo';

export default function DashboardClient({ initialWorkspaces }: { initialWorkspaces: Workspace[] }) {
  const router = useRouter();
  
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(initialWorkspaces[0] || null);
  
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const selectedFolder = folderPath[folderPath.length - 1] || null;

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  
  const [newName, setNewName] = useState('');
  
  // Renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceData(selectedWorkspace.id);
      setFolderPath([]);
    }
  }, [selectedWorkspace]);

  const loadWorkspaceData = async (workspaceId: string) => {
    try {
      const [foldersRes, notesRes] = await Promise.all([
        axios.get(`/api/folders?workspaceId=${workspaceId}`),
        axios.get(`/api/notes?workspaceId=${workspaceId}`)
      ]);
      setAllFolders(foldersRes.data);
      // Filter root level folders
      setFolders(foldersRes.data.filter((f: Folder) => !f.parentId));
      setNotes(notesRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const navigateToFolder = async (folder: Folder) => {
    setFolderPath(prev => [...prev, folder]);
    loadFolderContent(folder.id);
  };

  const navigateUp = () => {
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    const parentFolder = newPath[newPath.length - 1];
    
    if (parentFolder) {
      loadFolderContent(parentFolder.id);
    } else if (selectedWorkspace) {
      loadWorkspaceData(selectedWorkspace.id);
    }
  };

  const loadFolderContent = async (folderId: string) => {
    if (!selectedWorkspace) return;
    try {
      const notesRes = await axios.get(`/api/notes?workspaceId=${selectedWorkspace.id}&folderId=${folderId}`);
      setFolders(allFolders.filter(f => f.parentId === folderId));
      setNotes(notesRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  // --- Actions ---

  const handleCreateWorkspace = async () => {
    if (!newName.trim()) return;
    try {
      const res = await axios.post('/api/workspaces', { name: newName });
      setWorkspaces([res.data, ...workspaces]);
      setSelectedWorkspace(res.data);
      setNewName('');
      setIsWorkspaceModalOpen(false);
      toast.success('Workspace criado!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao criar workspace');
    }
  };

  const handleCreateFolder = async () => {
    if (!newName.trim() || !selectedWorkspace) return;
    try {
      const res = await axios.post('/api/folders', { 
        name: newName, 
        workspaceId: selectedWorkspace.id,
        parentId: selectedFolder ? selectedFolder.id : null
      });
      setFolders([res.data, ...folders]);
      setAllFolders([...allFolders, res.data]);
      setNewName('');
      setIsFolderModalOpen(false);
      toast.success('Pasta criada!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao criar pasta');
    }
  };

  const handleCreateNote = async () => {
    if (!newName.trim() || !selectedWorkspace) return;
    const id = crypto.randomUUID();
    
    try {
      await axios.post('/api/notes', { 
        id, 
        name: newName, 
        data: {},
        workspaceId: selectedWorkspace.id,
        folderId: selectedFolder ? selectedFolder.id : null
      });
      toast.success('Nota criada!');
      router.push(`/notes/${id}`);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao criar nota');
    }
  };

  const handleRename = async (type: 'workspace' | 'folder' | 'note', id: string) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      if (type === 'workspace') {
        setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name: editName } : w));
        if (selectedWorkspace?.id === id) setSelectedWorkspace({ ...selectedWorkspace, name: editName });
        await axios.put(`/api/workspaces/${id}`, { name: editName });
      } else if (type === 'folder') {
        setFolders(prev => prev.map(f => f.id === id ? { ...f, name: editName } : f));
        setAllFolders(prev => prev.map(f => f.id === id ? { ...f, name: editName } : f));
        await axios.put(`/api/folders/${id}`, { name: editName });
      } else {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, name: editName } : n));
        await axios.put(`/api/notes/${id}`, { name: editName });
      }
      toast.success('Renomeado com sucesso!');
    } catch (e) {
      console.error(e);
      toast.error('Erro ao renomear');
    }
    setEditingId(null);
  };

  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMenuOpenId(null);
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) return;
    setNotes(prev => prev.filter(n => n.id !== id));
    try {
      await axios.delete(`/api/notes/${id}`);
      toast.success('Nota excluída!');
    } catch (e) {
      toast.error('Erro ao excluir');
    }
  };

  // --- Drag and Drop ---
  
  const handleDragStart = (e: React.DragEvent, id: string, type: 'folder' | 'note') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('ring-2', 'ring-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-50');
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { id, type } = data;
      
      if (id === targetFolderId) return; // cannot drop into itself

      if (type === 'note') {
        setNotes(prev => prev.filter(n => n.id !== id));
        await axios.put(`/api/notes/${id}`, { folderId: targetFolderId });
      } else if (type === 'folder') {
        // Optimistic UI for folder move
        setFolders(prev => prev.filter(f => f.id !== id));
        const updatedAll = allFolders.map(f => f.id === id ? { ...f, parentId: targetFolderId } : f);
        setAllFolders(updatedAll);
        await axios.put(`/api/folders/${id}`, { parentId: targetFolderId });
      }
      toast.success('Movido com sucesso!');
    } catch (error) {
      console.error('Drop failed', error);
      toast.error('Erro ao mover');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-slate-800 flex flex-col md:flex-row font-sans">
      
      {/* Sidebar (Clean UI style) */}
      <aside className="w-full md:w-64 bg-[#F0F0F0] md:min-h-screen border-r border-slate-200 flex flex-col py-6">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 text-slate-800 flex items-center justify-center">
            <Logo className="w-full h-full" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            CloudCanvas
          </h1>
        </div>
        
        <div className="px-4 mb-2 flex items-center justify-between group">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Workspaces</h2>
          <button 
            onClick={() => { setIsWorkspaceModalOpen(true); setNewName(''); }} 
            className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" 
            title="Novo Workspace"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3">
          {workspaces.map(ws => (
            <div 
              key={ws.id}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all mb-1 ${selectedWorkspace?.id === ws.id ? 'bg-white shadow-sm text-blue-600 font-medium' : 'hover:bg-slate-200/50 text-slate-600'}`}
              onClick={() => { if (editingId !== ws.id) setSelectedWorkspace(ws); }}
            >
              {editingId === ws.id ? (
                <input
                  autoFocus
                  value={editName}
                  onClick={e => e.stopPropagation()}
                  onChange={e => setEditName(e.target.value)}
                  onBlur={() => handleRename('workspace', ws.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename('workspace', ws.id);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="w-full bg-transparent outline-none font-medium text-slate-800"
                />
              ) : (
                <span className="truncate flex-1">{ws.name}</span>
              )}

              {selectedWorkspace?.id === ws.id && editingId !== ws.id && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingId(ws.id); setEditName(ws.name); }}
                  className="text-slate-400 hover:text-blue-600 ml-2 opacity-0 hover:opacity-100 transition-opacity group"
                  style={{ opacity: selectedWorkspace?.id === ws.id ? 1 : 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 md:p-10 bg-[#F9F9F9]">
        {!selectedWorkspace ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400 text-lg">Selecione ou crie um workspace.</p>
          </div>
        ) : (
          <div className="max-w-6xl w-full mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
              <div className="flex items-center gap-3">
                {selectedFolder && (
                  <button 
                    onClick={navigateUp} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 shadow-sm transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  </button>
                )}
                <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                  {selectedFolder ? selectedFolder.name : 'Docs'}
                </h2>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsFolderModalOpen(true); setNewName(''); }}
                  className="bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-xl shadow-sm transition-all duration-200 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                  Nova Pasta
                </button>
                <button 
                  onClick={() => { setIsNoteModalOpen(true); setNewName(''); }}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Nova Nota
                </button>
              </div>
            </header>

            {/* Folders Grid */}
            {folders.length > 0 && (
              <div className="mb-10">
                <h3 className="text-sm font-semibold text-slate-500 mb-4">Pastas</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {folders.map(folder => (
                    <div 
                      key={folder.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, folder.id, 'folder')}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, folder.id)}
                      onClick={() => { if (editingId !== folder.id) navigateToFolder(folder); }}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center justify-center gap-3 transition-all group"
                    >
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-blue-500 transition-colors">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                      </svg>
                      
                      {editingId === folder.id ? (
                        <input
                          autoFocus
                          value={editName}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setEditName(e.target.value)}
                          onBlur={() => handleRename('folder', folder.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRename('folder', folder.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full bg-transparent border-b border-blue-400 outline-none text-sm font-medium text-center text-slate-800"
                        />
                      ) : (
                        <div className="flex items-center gap-2 w-full justify-center">
                          <span className="font-medium text-slate-700 truncate text-sm">{folder.name}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingId(folder.id); setEditName(folder.name); }}
                            className="text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Grid */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 mb-4">
                Anotações
              </h3>
              {notes.length === 0 && folders.length === 0 ? (
                <div className="p-12 border border-dashed border-slate-300 rounded-3xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </div>
                  <p className="text-slate-500 font-medium">Este workspace está vazio.</p>
                  <p className="text-sm text-slate-400 mt-1">Crie pastas ou anotações para começar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {notes.map(note => (
                    <div 
                      key={note.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, note.id, 'note')}
                      onClick={() => { if (editingId !== note.id) router.push(`/notes/${note.id}`); }}
                      className="group relative bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-[180px]"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm text-white shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </div>
                        
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === note.id ? null : note.id);
                            }}
                            className="text-slate-300 hover:text-slate-600 p-1 rounded-md transition-colors"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                          </button>
                          
                          {menuOpenId === note.id && (
                            <div className="absolute top-full right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl p-1 w-32 z-20">
                              <button 
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  setEditName(note.name);
                                  setEditingId(note.id);
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                Renomear
                              </button>
                              <button 
                                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                onClick={(e) => handleDeleteNote(e, note.id)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {editingId === note.id ? (
                        <input
                          autoFocus
                          value={editName}
                          onClick={e => e.stopPropagation()}
                          onChange={e => setEditName(e.target.value)}
                          onBlur={() => handleRename('note', note.id)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleRename('note', note.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full bg-transparent border-b border-blue-400 outline-none text-lg font-bold text-slate-800 mb-2"
                        />
                      ) : (
                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 mt-auto mb-2">
                          {note.name}
                        </h3>
                      )}
                      
                      <div className="flex flex-col items-start mt-auto border-t border-slate-100 pt-3 gap-1">
                        <div className="text-[11px] text-slate-400 font-medium">
                          Criado em: {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          Modificado: {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Clean UI Modal */}
      {(isNoteModalOpen || isFolderModalOpen || isWorkspaceModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl p-8 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold mb-6 text-slate-800">
              {isWorkspaceModalOpen ? 'Novo Workspace' : isFolderModalOpen ? 'Nova Pasta' : 'Nova Nota'}
            </h3>
            <input 
              autoFocus
              type="text" 
              placeholder="Digite o nome..." 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (isWorkspaceModalOpen) handleCreateWorkspace();
                  else if (isFolderModalOpen) handleCreateFolder();
                  else handleCreateNote();
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all mb-8 font-medium"
            />
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsWorkspaceModalOpen(false);
                  setIsFolderModalOpen(false);
                  setIsNoteModalOpen(false);
                }}
                className="px-5 py-2.5 text-slate-500 font-semibold hover:text-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (isWorkspaceModalOpen) handleCreateWorkspace();
                  else if (isFolderModalOpen) handleCreateFolder();
                  else handleCreateNote();
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-md"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
      <Toaster position="bottom-right" />
    </div>
  );
}
