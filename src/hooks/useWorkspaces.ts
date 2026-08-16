
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Workspace } from '@/types';
import { workspaceStore, addToSyncQueue } from '@/lib/offlineStore';

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const handleSetSelectedWorkspace = (workspace: Workspace | null) => {
    setSelectedWorkspace(workspace);
    if (workspace) {
      localStorage.setItem('last_workspace_id', workspace.id);
    } else {
      localStorage.removeItem('last_workspace_id');
    }
  };

  // 1. Initial Load from Local Cache, then background sync
  useEffect(() => {
    const loadFromCacheAndSync = async () => {
      // Fast load from local IndexedDB
      const cached = await workspaceStore.getItem<Workspace[]>('all_workspaces');
      
      const getRestoredWorkspace = (wsList: Workspace[]) => {
        if (!wsList || wsList.length === 0) return null;
        const lastId = localStorage.getItem('last_workspace_id');
        let found = wsList[0];
        if (lastId) {
          const match = wsList.find(w => w.id === lastId);
          if (match) found = match;
        }
        localStorage.setItem('last_workspace_id', found.id);
        return found;
      };

      if (cached && cached.length > 0) {
        setWorkspaces(cached);
        setSelectedWorkspace(getRestoredWorkspace(cached));
      }

      // Background sync with API
      try {
        const res = await axios.get('/api/workspaces');
        const freshData = res.data;
        setWorkspaces(freshData);
        if (!cached || cached.length === 0) {
          setSelectedWorkspace(getRestoredWorkspace(freshData));
        }
        await workspaceStore.setItem('all_workspaces', freshData);
      } catch (error) {
        console.log('Offline: relying on cached workspaces');
      }
    };

    loadFromCacheAndSync();
  }, []);

  const createWorkspace = async (name: string) => {
    // Optimistic UI
    const optimisticWs: Workspace = { id: crypto.randomUUID(), name };
    const newWorkspaces = [optimisticWs, ...workspaces];
    setWorkspaces(newWorkspaces);
    if (!selectedWorkspace) setSelectedWorkspace(optimisticWs);
    
    // Save locally immediately
    await workspaceStore.setItem('all_workspaces', newWorkspaces);

    try {
      if (navigator.onLine) {
        const res = await axios.post('/api/workspaces', { name });
        // Update with real ID from server
        const updated = newWorkspaces.map(w => w.id === optimisticWs.id ? res.data : w);
        setWorkspaces(updated);
        await workspaceStore.setItem('all_workspaces', updated);
      } else {
        await addToSyncQueue({ entity: 'workspace', action: 'create', payload: { id: optimisticWs.id, name } });
      }
      toast.success('Workspace criado!');
      return true;
    } catch {
      await addToSyncQueue({ entity: 'workspace', action: 'create', payload: { id: optimisticWs.id, name } });
      toast.success('Workspace salvo offline!');
      return true;
    }
  };

  const renameWorkspace = async (id: string, newName: string) => {
    // Optimistic UI
    const updated = workspaces.map(w => w.id === id ? { ...w, name: newName } : w);
    setWorkspaces(updated);
    if (selectedWorkspace?.id === id) setSelectedWorkspace({ ...selectedWorkspace, name: newName });
    
    // Save locally
    await workspaceStore.setItem('all_workspaces', updated);

    try {
      if (navigator.onLine) {
        await axios.put(`/api/workspaces/${id}`, { name: newName });
      } else {
        await addToSyncQueue({ entity: 'workspace', action: 'update', payload: { id, name: newName } });
      }
      toast.success('Workspace renomeado!');
    } catch {
      await addToSyncQueue({ entity: 'workspace', action: 'update', payload: { id, name: newName } });
      toast.success('Alteração salva offline!');
    }
  };

  return { workspaces, selectedWorkspace, setSelectedWorkspace: handleSetSelectedWorkspace, createWorkspace, renameWorkspace };
}
