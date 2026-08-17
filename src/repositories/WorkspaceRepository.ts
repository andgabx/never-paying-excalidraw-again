import { Workspace } from '@/types';

export interface ApiClient {
  get(url: string): Promise<{ data: any }>;
  post(url: string, data: any): Promise<{ data: any }>;
  put(url: string, data: any): Promise<{ data: any }>;
}

export interface LocalCache<T> {
  getItem(key: string): Promise<T | null>;
  setItem(key: string, value: T): Promise<T>;
}

export type EnqueueFn = (operation: { entity: 'workspace' | 'folder' | 'tag' | 'note', action: 'create' | 'update' | 'delete', payload: any }) => Promise<void>;

export class WorkspaceRepository {
  constructor(
    private apiClient: ApiClient,
    private localCache: LocalCache<Workspace[]>,
    private enqueue: EnqueueFn,
    private isOnline: () => boolean
  ) {}

  async loadFromCache(): Promise<Workspace[]> {
    return (await this.localCache.getItem('all_workspaces')) || [];
  }

  async fetchFromServer(): Promise<Workspace[]> {
    try {
      const res = await this.apiClient.get('/api/workspaces');
      await this.localCache.setItem('all_workspaces', res.data);
      return res.data;
    } catch (e) {
      // Offline fallback
      return this.loadFromCache();
    }
  }

  async saveLocally(workspaces: Workspace[]): Promise<void> {
    await this.localCache.setItem('all_workspaces', workspaces);
  }

  async create(workspace: Workspace, currentWorkspaces: Workspace[]): Promise<Workspace[]> {
    const newWorkspaces = [workspace, ...currentWorkspaces];
    await this.saveLocally(newWorkspaces);

    const isNetUp = this.isOnline();
    if (isNetUp) {
      try {
        const res = await this.apiClient.post('/api/workspaces', { name: workspace.name });
        const updated = newWorkspaces.map(w => w.id === workspace.id ? res.data : w);
        await this.saveLocally(updated);
        return updated;
      } catch {
        await this.enqueue({ entity: 'workspace', action: 'create', payload: { id: workspace.id, name: workspace.name } });
        return newWorkspaces;
      }
    } else {
      await this.enqueue({ entity: 'workspace', action: 'create', payload: { id: workspace.id, name: workspace.name } });
      return newWorkspaces;
    }
  }

  async rename(id: string, newName: string, currentWorkspaces: Workspace[]): Promise<Workspace[]> {
    const updated = currentWorkspaces.map(w => w.id === id ? { ...w, name: newName } : w);
    await this.saveLocally(updated);

    const isNetUp = this.isOnline();
    if (isNetUp) {
      try {
        await this.apiClient.put(`/api/workspaces/${id}`, { name: newName });
      } catch {
        await this.enqueue({ entity: 'workspace', action: 'update', payload: { id, name: newName } });
      }
    } else {
      await this.enqueue({ entity: 'workspace', action: 'update', payload: { id, name: newName } });
    }
    return updated;
  }
}
