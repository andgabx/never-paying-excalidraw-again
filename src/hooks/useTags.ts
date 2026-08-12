
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Tag } from '@/types';

export function useTags(selectedWorkspaceId: string | undefined) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedSidebarTag, setSelectedSidebarTag] = useState<Tag | null>(null);

  const loadTags = async (workspaceId: string) => {
    try {
      const res = await axios.get(`/api/tags?workspaceId=${workspaceId}`);
      setTags(res.data);
      setSelectedSidebarTag(null);
    } catch (error) { console.error(error); }
  };

  const createTag = async (name: string, color: string, targetWorkspaceId: string) => {
    try {
      const res = await axios.post('/api/tags', { 
        name, color, workspaceId: targetWorkspaceId 
      });
      if (targetWorkspaceId === selectedWorkspaceId) {
          setTags(prev => [res.data, ...prev]);
      }
      toast.success('Tag criada!');
      return true;
    } catch { toast.error('Erro ao criar tag');
      return false;
    }
  };

  const updateTag = async (id: string, name: string, color: string) => {
    try {
      const res = await axios.put(`/api/tags/${id}`, { name, color });
      setTags(prev => prev.map(t => t.id === id ? res.data : t));
      if (selectedSidebarTag?.id === id) {
        setSelectedSidebarTag(res.data);
      }
      toast.success('Tag atualizada!');
      return true;
    } catch {
      toast.error('Erro ao atualizar tag');
      return false;
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Excluir tag? As notas com esta tag não serão apagadas.')) return false;
    try {
      await axios.delete(`/api/tags/${id}`);
      setTags(prev => prev.filter(t => t.id !== id));
      if (selectedSidebarTag?.id === id) {
        setSelectedSidebarTag(null);
      }
      toast.success('Tag excluída!');
      return true;
    } catch {
      toast.error('Erro ao excluir tag');
      return false;
    }
  };

  return { tags, selectedSidebarTag, setSelectedSidebarTag, loadTags, createTag, updateTag, deleteTag };
}
