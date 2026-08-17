import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Workspace } from '@/types';
import { workspaceRepository } from '@/lib/repositories';

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
      // Fast load from local IndexedDB via Repository
      const cached = await workspaceRepository.loadFromCache();
      
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

      // Background sync with API via Repository
      const freshData = await workspaceRepository.fetchFromServer();
      if (freshData.length > 0) {
        setWorkspaces(freshData);
        if (!cached || cached.length === 0) {
          setSelectedWorkspace(getRestoredWorkspace(freshData));
        }
      }
    };

    loadFromCacheAndSync();
  }, []);

  const createWorkspace = async (name: string) => {
    // Optimistic UI
    const optimisticWs: Workspace = { id: crypto.randomUUID(), name };
    setWorkspaces([optimisticWs, ...workspaces]);
    if (!selectedWorkspace) handleSetSelectedWorkspace(optimisticWs);
    
    // Delegate to repository
    const updatedWorkspaces = await workspaceRepository.create(optimisticWs, workspaces);
    setWorkspaces(updatedWorkspaces);
    
    toast.success('Workspace salvo!');
    return true;
  };

  const renameWorkspace = async (id: string, newName: string) => {
    // Optimistic UI
    setWorkspaces(workspaces.map(w => w.id === id ? { ...w, name: newName } : w));
    if (selectedWorkspace?.id === id) setSelectedWorkspace({ ...selectedWorkspace, name: newName });
    
    // Delegate to repository
    const updatedWorkspaces = await workspaceRepository.rename(id, newName, workspaces);
    setWorkspaces(updatedWorkspaces);
    
    toast.success('Workspace renomeado!');
  };

  return { workspaces, selectedWorkspace, setSelectedWorkspace: handleSetSelectedWorkspace, createWorkspace, renameWorkspace };
}
