
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Note, Tag } from '@/types';
import { useRouter } from 'next/navigation';

export function useNotes(tags: Tag[]) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = async (workspaceId: string, folderId?: string | null) => {
    try {
      setIsLoading(true);
      const url = folderId 
        ? `/api/notes?workspaceId=${workspaceId}&folderId=${folderId}`
        : `/api/notes?workspaceId=${workspaceId}`;
      const res = await axios.get(url);
      setNotes(res.data);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const createNote = async (name: string, targetWorkspaceId: string, folderId: string | null, tagIds: string[]) => {
    const id = crypto.randomUUID();
    try {
      await axios.post('/api/notes', { 
        id, name, data: {}, workspaceId: targetWorkspaceId, folderId, tagIds
      });
      toast.success('Nota criada!');
      router.push(`/notes/${id}`);
      return true;
    } catch { toast.error('Erro ao criar nota');
      return false;
    }
  };

  const renameNote = async (id: string, newName: string) => {
    try {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, name: newName } : n));
      await axios.put(`/api/notes/${id}`, { name: newName });
      toast.success('Nota renomeada!');
    } catch { toast.error('Erro ao renomear nota'); }
  };

  const deleteNote = async (id: string) => {
    try {
      setNotes(prev => prev.filter(n => n.id !== id));
      await axios.delete(`/api/notes/${id}`);
      toast.success('Excluída!');
    } catch { toast.error('Erro ao excluir'); }
  };

  const moveNote = async (id: string, targetFolderId: string | null, targetWorkspaceId?: string, destinationName?: string) => {
    try {
      const label = destinationName ? `→ ${destinationName}` : '';
      if (targetWorkspaceId) {
         setNotes(prev => prev.filter(n => n.id !== id));
         await axios.put(`/api/notes/${id}`, { folderId: targetFolderId, workspaceId: targetWorkspaceId });
         toast.success(`Nota movida ${label}`);
         return;
      }
      setNotes(prev => prev.filter(n => n.id !== id));
      await axios.put(`/api/notes/${id}`, { folderId: targetFolderId });
      toast.success(`Nota movida ${label}`);
    } catch { toast.error('Erro ao mover nota'); }
  };

  const updateNoteTags = async (noteId: string, tagIds: string[]) => {
    try {
      await axios.put(`/api/notes/${noteId}`, { tagIds });
      const newTags = tagIds.map(id => {
        const t = tags.find(tag => tag.id === id);
        return { id: t?.id || id, name: t?.name || '', color: t?.color || 'brand-1' };
      });
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, tags: newTags } : n));
      toast.success('Tags atualizadas!');
      return true;
    } catch { toast.error('Erro ao atualizar tags');
      return false;
    }
  };

  const searchNotesAPI = async (query: string, scope: 'global' | 'workspace' | 'folder', workspaceId: string, folderId: string | null) => {
    try {
      setIsLoading(true);
      let url = `/api/notes?search=${encodeURIComponent(query)}&scope=${scope}&workspaceId=${workspaceId}`;
      if (folderId) url += `&folderId=${folderId}`;
      const res = await axios.get(url);
      setNotes(res.data);
    } catch (error) {
      toast.error('Erro ao pesquisar notas');
    } finally {
      setIsLoading(false);
    }
  };

  const bulkDeleteNotes = async (ids: string[]) => {
    try {
      setNotes(prev => prev.filter(n => !ids.includes(n.id)));
      await Promise.all(ids.map(id => axios.delete(`/api/notes/${id}`)));
      toast.success(`${ids.length} notas excluídas!`);
    } catch { toast.error('Erro ao excluir notas'); }
  };

  const bulkMoveNotes = async (ids: string[], targetFolderId: string | null, targetWorkspaceId?: string, destinationName?: string) => {
    try {
      setNotes(prev => prev.filter(n => !ids.includes(n.id)));
      const payload = targetWorkspaceId 
        ? { folderId: targetFolderId, workspaceId: targetWorkspaceId } 
        : { folderId: targetFolderId };
      await Promise.all(ids.map(id => axios.put(`/api/notes/${id}`, payload)));
      const label = destinationName ? ` para ${destinationName}` : '';
      toast.success(`${ids.length} notas movidas${label}!`);
    } catch { toast.error('Erro ao mover notas'); }
  };

  return { notes, isLoading, loadNotes, createNote, renameNote, deleteNote, moveNote, bulkDeleteNotes, bulkMoveNotes, updateNoteTags, searchNotesAPI };
}
