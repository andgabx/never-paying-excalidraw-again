'use client';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Workspace, Note, Folder, Tag } from '@/types';
import axios from 'axios';

import { useWorkspaces } from '@/hooks/useWorkspaces';
import { useFolders } from '@/hooks/useFolders';
import { useTags } from '@/hooks/useTags';
import { useNotes } from '@/hooks/useNotes';

import { Sidebar } from './dashboard/Sidebar';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { FolderGrid } from './dashboard/FolderGrid';
import { NoteGrid } from './dashboard/NoteGrid';

import { 
  CreateWorkspaceModal, 
  CreateFolderModal, 
  CreateTagModal, 
  CreateNoteModal, 
  EditTagsModal,
  UpdateTagModal,
  ConfirmModal
} from './modals';

export default function DashboardClient({ initialWorkspaces }: { initialWorkspaces: Workspace[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [committedSearchQuery, setCommittedSearchQuery] = useState('');
  
  // Custom Hooks for State
  const { workspaces, selectedWorkspace, setSelectedWorkspace, createWorkspace, renameWorkspace } = useWorkspaces(initialWorkspaces);
  const { allFolders, folders, selectedFolder, loadFolders, navigateToFolder, navigateUp, createFolder, renameFolder, moveFolder } = useFolders(selectedWorkspace?.id);
  const { tags, selectedSidebarTag, setSelectedSidebarTag, loadTags, createTag, updateTag, deleteTag } = useTags(selectedWorkspace?.id);
  const { notes, isLoading, loadNotes, createNote, renameNote, deleteNote, moveNote, bulkDeleteNotes, bulkMoveNotes, updateNoteTags, searchNotesAPI } = useNotes(tags);

  // Modals & UI State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isEditTagsModalOpen, setIsEditTagsModalOpen] = useState(false);
  const [isUpdateTagModalOpen, setIsUpdateTagModalOpen] = useState(false);
  const [isDeleteNoteModalOpen, setIsDeleteNoteModalOpen] = useState(false);
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [bulkActionIds, setBulkActionIds] = useState<string[]>([]);
  const [tagToUpdate, setTagToUpdate] = useState<Tag | null>(null);
  
  // Modal forms state
  const [newName, setNewName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const [selectedTagsForNewNote, setSelectedTagsForNewNote] = useState<string[]>([]);
  const [selectedFolderForNewNote, setSelectedFolderForNewNote] = useState<string | null>(null);
  const [modalWorkspaceId, setModalWorkspaceId] = useState<string>('');
  const [modalFolders, setModalFolders] = useState<Folder[]>([]);
  const [modalTags, setModalTags] = useState<Tag[]>([]);
  const [editingNoteForTags, setEditingNoteForTags] = useState<Note | null>(null);

  useEffect(() => {
    const handleClick = () => setMenuOpenId(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoadingContent(true);
      Promise.all([
        loadFolders(selectedWorkspace.id),
        loadTags(selectedWorkspace.id),
        loadNotes(selectedWorkspace.id)
      ]).finally(() => {
        setIsLoadingContent(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWorkspace?.id]);

  // Modal Handlers
  const handleModalWorkspaceChange = async (wsId: string) => {
    setModalWorkspaceId(wsId);
    setSelectedFolderForNewNote(null);
    setSelectedTagsForNewNote([]);
    if (wsId === selectedWorkspace?.id) {
        setModalFolders(allFolders);
        setModalTags(tags);
    } else {
        try {
            const [fRes, tRes] = await Promise.all([
                axios.get(`/api/folders?workspaceId=${wsId}`),
                axios.get(`/api/tags?workspaceId=${wsId}`)
            ]);
            setModalFolders(fRes.data);
            setModalTags(tRes.data);
        } catch (error) { console.error(error); }
    }
  };

  const openNoteModal = () => {
    setNewName('');
    setModalWorkspaceId(selectedWorkspace?.id || workspaces[0]?.id || '');
    setModalFolders(allFolders);
    setModalTags(tags);
    setSelectedTagsForNewNote(selectedSidebarTag ? [selectedSidebarTag.id] : []);
    setSelectedFolderForNewNote(selectedFolder ? selectedFolder.id : null);
    setIsNoteModalOpen(true);
  };

  const openFolderModal = () => {
    setNewName('');
    setModalWorkspaceId(selectedWorkspace?.id || workspaces[0]?.id || '');
    setModalFolders(allFolders);
    setSelectedFolderForNewNote(selectedFolder ? selectedFolder.id : null);
    setIsFolderModalOpen(true);
  };

  const openTagModal = () => {
    setNewName('');
    setNewTagColor('blue');
    setModalWorkspaceId(selectedWorkspace?.id || workspaces[0]?.id || '');
    setIsTagModalOpen(true);
  };

  const handleUpdateTag = async () => {
    if (tagToUpdate) {
      await updateTag(tagToUpdate.id, newName, newTagColor);
      setIsUpdateTagModalOpen(false);
      setTagToUpdate(null);
    }
  };

  const handleDeleteTag = async () => {
    if (tagToUpdate) {
      await deleteTag(tagToUpdate.id);
      setIsUpdateTagModalOpen(false);
      setTagToUpdate(null);
    }
  };

  // UI Filtering
  let displayedNotes = selectedSidebarTag 
    ? notes.filter(n => n.tags?.some(t => t.id === selectedSidebarTag.id))
    : notes;

  return (
    <div className="min-h-screen bg-brand-5 text-brand-1 flex flex-col md:flex-row font-sans">
      <Sidebar 
        workspaces={workspaces} selectedWorkspace={selectedWorkspace} tags={tags} selectedSidebarTag={selectedSidebarTag}
        editingId={editingId} editName={editName}
        onSelectWorkspace={(ws) => { setEditingId(null); setSelectedWorkspace(ws); }}
        onSetEditingId={setEditingId} onSetEditName={setEditName} onRenameWorkspace={renameWorkspace}
        onSelectTag={setSelectedSidebarTag} onOpenWorkspaceModal={() => { setIsWorkspaceModalOpen(true); setNewName(''); }} onOpenTagModal={openTagModal}
        onEditTag={(tag) => {
          setTagToUpdate(tag);
          setNewName(tag.name);
          setNewTagColor(tag.color);
          setIsUpdateTagModalOpen(true);
        }}
        onDropToWorkspace={async (e, targetWorkspaceId) => {
          const { id, type } = JSON.parse(e.dataTransfer.getData('text/plain'));
          if (targetWorkspaceId === selectedWorkspace?.id) return;
          const targetWs = workspaces.find(w => w.id === targetWorkspaceId);
          const destName = targetWs?.name;
          if (type === 'note') moveNote(id, null, targetWorkspaceId, destName);
          else if (type === 'folder') moveFolder(id, null, targetWorkspaceId, destName);
        }}
      />

      <main className="flex-1 flex flex-col p-6 md:p-12 overflow-y-auto relative bg-brand-5">
        {!selectedWorkspace ? (
          <div className="flex-1 flex items-center justify-center"><p className="text-brand-2 text-lg font-medium">Selecione ou crie um workspace.</p></div>
        ) : (
          <div className="max-w-6xl w-full mx-auto relative z-10">
            <DashboardHeader 
              searchQuery={searchQuery} setSearchQuery={setSearchQuery} 
              onCommitSearch={async () => {
                setCommittedSearchQuery(searchQuery);
                setIsLoadingContent(true);
                try {
                  if (!searchQuery.trim()) {
                    if (selectedWorkspace) await loadNotes(selectedWorkspace.id, selectedFolder?.id || null);
                  } else {
                    if (selectedWorkspace) await searchNotesAPI(searchQuery, 'global', selectedWorkspace.id, selectedFolder?.id || null);
                  }
                } finally {
                  setIsLoadingContent(false);
                }
              }} 
              clearSearch={async () => {
                setSearchQuery('');
                setCommittedSearchQuery('');
                setIsLoadingContent(true);
                try {
                  if (selectedWorkspace) await loadNotes(selectedWorkspace.id, selectedFolder?.id || null);
                } finally {
                  setIsLoadingContent(false);
                }
              }}
              selectedSidebarTag={selectedSidebarTag} selectedFolder={selectedFolder}
              onOpenFolderModal={openFolderModal} onOpenNoteModal={openNoteModal} onNavigateUp={() => navigateUp(() => loadNotes(selectedWorkspace.id), (fid) => loadNotes(selectedWorkspace.id, fid))}
              onDropToParent={async (e) => {
                const { id, type } = JSON.parse(e.dataTransfer.getData('text/plain'));
                const parentFolder = allFolders.find(f => f.id === selectedFolder?.parentId);
                const destName = parentFolder?.name ?? selectedWorkspace?.name;
                if (type === 'note') moveNote(id, selectedFolder?.parentId || null, undefined, destName);
                else if (type === 'folder') moveFolder(id, selectedFolder?.parentId || null, undefined, destName);
              }}
            />

            {isLoadingContent ? (
              <div className="mt-8 animate-pulse">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 bg-brand-4/50 rounded w-24"></div>
                  <div className="h-6 bg-brand-4/50 rounded-full w-8"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-14">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="bg-brand-4/50 rounded-[32px] p-5 h-36 flex flex-col justify-between">
                      <div className="w-10 h-10 bg-brand-4 rounded"></div>
                      <div className="h-4 bg-brand-4 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-6 bg-brand-4/50 rounded w-28"></div>
                  <div className="h-6 bg-brand-4/50 rounded-full w-8"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-brand-4/50 rounded-[32px] overflow-hidden h-[220px]">
                      <div className="h-28 bg-brand-4"></div>
                      <div className="flex-1 -mt-6 rounded-t-3xl bg-brand-4/80 p-5 flex flex-col relative z-10">
                        <div className="h-5 bg-brand-5/50 rounded w-full mb-2"></div>
                        <div className="h-3 bg-brand-5/50 rounded w-1/2 mb-auto"></div>
                        <div className="flex gap-1.5 mt-4">
                          <div className="w-3 h-3 rounded-full bg-brand-5/50"></div>
                          <div className="w-3 h-3 rounded-full bg-brand-5/50"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {!selectedSidebarTag && folders.length > 0 && !committedSearchQuery && (
                  <FolderGrid 
                    folders={folders} editingId={editingId} editName={editName}
                    onNavigateToFolder={(f) => navigateToFolder(f, (fid) => loadNotes(selectedWorkspace.id, fid))} onSetEditingId={setEditingId} onSetEditName={setEditName} onRenameFolder={renameFolder}
                    onDragStart={(e, id, type) => { e.dataTransfer.setData('text/plain', JSON.stringify({ id, type })); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; e.currentTarget.classList.add('ring-2', 'ring-brand-2', 'bg-brand-4/20'); }}
                    onDragLeave={e => e.currentTarget.classList.remove('ring-2', 'ring-brand-2', 'bg-brand-4/20')}
                    onDrop={async (e, targetFolderId) => {
                      e.preventDefault(); e.currentTarget.classList.remove('ring-2', 'ring-brand-2', 'bg-brand-4/20');
                      const { id, type } = JSON.parse(e.dataTransfer.getData('text/plain'));
                      if (id === targetFolderId) return;
                      const targetFolder = allFolders.find(f => f.id === targetFolderId);
                      const destName = targetFolder?.name;
                      if (type === 'note') moveNote(id, targetFolderId, selectedWorkspace?.id, destName);
                      else if (type === 'folder') moveFolder(id, targetFolderId, selectedWorkspace?.id, destName);
                    }}
                  />
                )}
                
                <NoteGrid 
                  notes={displayedNotes} isLoading={isLoading} editingId={editingId} editName={editName} menuOpenId={menuOpenId}
                  onSetEditingId={setEditingId} onSetEditName={setEditName} onSetMenuOpenId={setMenuOpenId} onRenameNote={renameNote} onDeleteNote={(e, id) => { e.stopPropagation(); setDeleteNoteId(id); setIsDeleteNoteModalOpen(true); }}
                  onOpenEditTagsModal={(note) => { setEditingNoteForTags(note); setSelectedTagsForNewNote(note.tags?.map(t => t.id) || []); setIsEditTagsModalOpen(true); }}
                  onDragStart={(e, id, type) => { e.dataTransfer.setData('text/plain', JSON.stringify({ id, type })); e.dataTransfer.effectAllowed = 'move'; }}
                  onBulkDelete={(ids) => {
                    setBulkActionIds(ids);
                    setIsBulkDeleteModalOpen(true);
                  }}
                  onBulkMove={(ids) => {
                    setBulkActionIds(ids);
                    setModalWorkspaceId(selectedWorkspace?.id || workspaces[0]?.id || '');
                    setModalFolders(allFolders);
                    setSelectedFolderForNewNote(null);
                    setIsBulkMoveModalOpen(true);
                  }}
                />
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals Mounting */}
      {isWorkspaceModalOpen && <CreateWorkspaceModal newName={newName} setNewName={setNewName} onClose={() => setIsWorkspaceModalOpen(false)} onSave={async () => { await createWorkspace(newName); setIsWorkspaceModalOpen(false); }} />}
      {isFolderModalOpen && <CreateFolderModal newName={newName} setNewName={setNewName} workspaces={workspaces} modalWorkspaceId={modalWorkspaceId} setModalWorkspaceId={handleModalWorkspaceChange} modalFolders={modalFolders} selectedFolderForNewNote={selectedFolderForNewNote} setSelectedFolderForNewNote={setSelectedFolderForNewNote} onClose={() => setIsFolderModalOpen(false)} onSave={async () => { await createFolder(newName, modalWorkspaceId, selectedFolderForNewNote); setIsFolderModalOpen(false); }} />}
      {isTagModalOpen && <CreateTagModal isOpen={true} newName={newName} setNewName={setNewName} newTagColor={newTagColor} setNewTagColor={setNewTagColor} workspaces={workspaces} modalWorkspaceId={modalWorkspaceId} setModalWorkspaceId={handleModalWorkspaceChange} onClose={() => setIsTagModalOpen(false)} onSave={async () => { await createTag(newName, newTagColor, modalWorkspaceId); setIsTagModalOpen(false); }} />}
      {isNoteModalOpen && <CreateNoteModal newName={newName} setNewName={setNewName} workspaces={workspaces} modalWorkspaceId={modalWorkspaceId} setModalWorkspaceId={handleModalWorkspaceChange} modalFolders={modalFolders} selectedFolderForNewNote={selectedFolderForNewNote} setSelectedFolderForNewNote={setSelectedFolderForNewNote} modalTags={modalTags} selectedTagsForNewNote={selectedTagsForNewNote} toggleTagForNewNote={(id: string) => setSelectedTagsForNewNote(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])} onClose={() => setIsNoteModalOpen(false)} onSave={async () => { await createNote(newName, modalWorkspaceId, selectedFolderForNewNote, selectedTagsForNewNote); setIsNoteModalOpen(false); }} />}
      {isEditTagsModalOpen && <EditTagsModal note={editingNoteForTags} tags={tags} selectedTagsForNewNote={selectedTagsForNewNote} toggleTagForNewNote={(id: string) => setSelectedTagsForNewNote(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])} onClose={() => { setIsEditTagsModalOpen(false); setEditingNoteForTags(null); }} onSave={async () => { if (editingNoteForTags) { await updateNoteTags(editingNoteForTags.id, selectedTagsForNewNote); setIsEditTagsModalOpen(false); setEditingNoteForTags(null); } }} />}
      
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#212529', color: '#ADB5BD', border: '1px solid #495057', fontWeight: 'bold' } }} />
      <UpdateTagModal
        isOpen={isUpdateTagModalOpen}
        onClose={() => setIsUpdateTagModalOpen(false)}
        newName={newName}
        setNewName={setNewName}
        newTagColor={newTagColor}
        setNewTagColor={setNewTagColor}
        onSave={handleUpdateTag}
        onDelete={handleDeleteTag}
      />
      
      {isBulkMoveModalOpen && (
        <div className="fixed inset-0 bg-brand-5/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-5 border border-brand-4 rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-brand-1 mb-6">Mover {bulkActionIds.length} Notas</h2>
            
            {workspaces.length > 0 && (
              <div className="mb-6">
                <label className="text-[11px] font-black text-brand-2 uppercase tracking-wider mb-2 block">Workspace de Destino</label>
                <select value={modalWorkspaceId} onChange={e => handleModalWorkspaceChange(e.target.value)} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-xl px-4 py-3 text-brand-1 outline-none focus:border-brand-2 transition-all font-bold text-sm appearance-none">
                  {workspaces.map((ws) => <option key={ws.id} value={ws.id}>{ws.name}</option>)}
                </select>
              </div>
            )}
      
            <div className="mb-8">
              <label className="text-[11px] font-black text-brand-2 uppercase tracking-wider mb-2 block">Pasta de Destino</label>
              <select value={selectedFolderForNewNote || ''} onChange={e => setSelectedFolderForNewNote(e.target.value || null)} className="w-full bg-brand-5/60 border-2 border-brand-3/30 rounded-xl px-4 py-3 text-brand-1 outline-none focus:border-brand-2 transition-all font-bold text-sm appearance-none">
                <option value="">Raiz do Workspace (Overview)</option>
                {modalFolders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsBulkMoveModalOpen(false)} className="flex-1 px-4 py-3 rounded-2xl font-bold text-sm bg-brand-4/50 text-brand-2 hover:bg-brand-4 hover:text-brand-1 transition-all">Cancelar</button>
              <button onClick={async () => {
                await bulkMoveNotes(bulkActionIds, selectedFolderForNewNote, modalWorkspaceId, undefined);
                setIsBulkMoveModalOpen(false);
              }} className="flex-1 px-4 py-3 rounded-2xl font-bold text-sm bg-brand-2 text-brand-5 hover:bg-brand-1 transition-all">Mover</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteNoteModalOpen}
        onClose={() => { setIsDeleteNoteModalOpen(false); setDeleteNoteId(null); }}
        onConfirm={() => { if (deleteNoteId) deleteNote(deleteNoteId); }}
        title="Excluir Nota"
        message="Tem certeza que deseja excluir esta nota?"
        confirmText="Excluir"
        isDestructive={true}
      />

      <ConfirmModal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={async () => {
          await bulkDeleteNotes(bulkActionIds);
          setIsBulkDeleteModalOpen(false);
        }}
        title="Excluir Notas em Massa"
        message={`Tem certeza que deseja excluir as ${bulkActionIds.length} notas selecionadas?`}
        confirmText="Excluir"
        isDestructive={true}
      />
    </div>
  );
}
