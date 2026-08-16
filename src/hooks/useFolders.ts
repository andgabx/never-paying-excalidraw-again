
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Folder } from '@/types';

export function useFolders(selectedWorkspaceId: string | undefined) {
  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderPath, setFolderPath] = useState<Folder[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('last_folder_path');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [];
  });
  
  const selectedFolder = folderPath[folderPath.length - 1] || null;

  const loadFolders = async (workspaceId: string) => {
    try {
      const res = await axios.get(`/api/folders?workspaceId=${workspaceId}`);
      setAllFolders(res.data);
      
      if (folderPath.length > 0) {
        const currentFolderId = folderPath[folderPath.length - 1].id;
        setFolders(res.data.filter((f: Folder) => f.parentId === currentFolderId));
      } else {
        setFolders(res.data.filter((f: Folder) => !f.parentId));
      }
    } catch (error) { console.error(error); }
  };

  const navigateToFolder = async (folder: Folder, loadNotes: (folderId: string) => void) => {
    const newPath = [...folderPath, folder];
    setFolderPath(newPath);
    localStorage.setItem('last_folder_path', JSON.stringify(newPath));
    setFolders(allFolders.filter(f => f.parentId === folder.id));
    loadNotes(folder.id);
  };

  const navigateUp = (loadWorkspaceData: () => void, loadFolderContent: (folderId: string) => void) => {
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    localStorage.setItem('last_folder_path', JSON.stringify(newPath));
    const parentFolder = newPath[newPath.length - 1];
    if (parentFolder) {
      setFolders(allFolders.filter(f => f.parentId === parentFolder.id));
      loadFolderContent(parentFolder.id);
    } else {
      loadWorkspaceData();
    }
  };

  const createFolder = async (name: string, targetWorkspaceId: string, parentId: string | null) => {
    try {
      const res = await axios.post('/api/folders', { 
        name, workspaceId: targetWorkspaceId, parentId 
      });
      if (targetWorkspaceId === selectedWorkspaceId) {
        setAllFolders(prev => [...prev, res.data]);
        if ((!parentId && !selectedFolder) || (selectedFolder && parentId === selectedFolder.id)) {
            setFolders(prev => [res.data, ...prev]);
        }
      }
      toast.success('Pasta criada!');
      return true;
    } catch { toast.error('Erro ao criar pasta');
      return false;
    }
  };

  const renameFolder = async (id: string, newName: string) => {
    try {
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      setAllFolders(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
      await axios.put(`/api/folders/${id}`, { name: newName });
      toast.success('Pasta renomeada!');
    } catch { toast.error('Erro ao renomear pasta'); }
  };

  const moveFolder = async (id: string, targetFolderId: string | null, targetWorkspaceId?: string, destinationName?: string) => {
    try {
      const label = destinationName ? `→ ${destinationName}` : '';
      if (targetWorkspaceId && targetWorkspaceId !== selectedWorkspaceId) {
        setFolders(prev => prev.filter(f => f.id !== id));
        setAllFolders(prev => prev.filter(f => f.id !== id));
        await axios.put(`/api/folders/${id}`, { parentId: targetFolderId, workspaceId: targetWorkspaceId });
        toast.success(`Pasta movida ${label}`);
        return;
      }
      setFolders(prev => prev.filter(f => f.id !== id));
      setAllFolders(prev => prev.map(f => f.id === id ? { ...f, parentId: targetFolderId } : f));
      await axios.put(`/api/folders/${id}`, { parentId: targetFolderId });
      toast.success(`Pasta movida ${label}`);
    } catch { toast.error('Erro ao mover pasta'); }
  };

  return { 
    allFolders, folders, folderPath, selectedFolder, setFolderPath,
    loadFolders, navigateToFolder, navigateUp, 
    createFolder, renameFolder, moveFolder 
  };
}
