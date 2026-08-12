
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Workspace } from '@/types';

export function useWorkspaces(initialWorkspaces: Workspace[]) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(initialWorkspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(initialWorkspaces[0] || null);

  const createWorkspace = async (name: string) => {
    try {
      const res = await axios.post('/api/workspaces', { name });
      setWorkspaces([res.data, ...workspaces]);
      if (!selectedWorkspace) setSelectedWorkspace(res.data);
      toast.success('Workspace criado!');
      return true;
    } catch { toast.error('Erro ao criar workspace');
      return false;
    }
  };

  const renameWorkspace = async (id: string, newName: string) => {
    try {
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, name: newName } : w));
      if (selectedWorkspace?.id === id) setSelectedWorkspace({ ...selectedWorkspace, name: newName });
      await axios.put(`/api/workspaces/${id}`, { name: newName });
      toast.success('Workspace renomeado!');
    } catch { toast.error('Erro ao renomear workspace');
    }
  };

  return { workspaces, selectedWorkspace, setSelectedWorkspace, createWorkspace, renameWorkspace };
}
