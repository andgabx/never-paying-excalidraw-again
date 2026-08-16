import localforage from 'localforage';

export const workspaceStore = localforage.createInstance({ name: 'cloudcanvas', storeName: 'workspaces' });
export const folderStore = localforage.createInstance({ name: 'cloudcanvas', storeName: 'folders' });
export const tagStore = localforage.createInstance({ name: 'cloudcanvas', storeName: 'tags' });
export const noteMetadataStore = localforage.createInstance({ name: 'cloudcanvas', storeName: 'notes_metadata' });
export const syncQueueStore = localforage.createInstance({ name: 'cloudcanvas', storeName: 'sync_queue' });

export type SyncOperation = {
  id: string; // Unique ID for the operation
  entity: 'workspace' | 'folder' | 'tag' | 'note';
  action: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: number;
};

export const addToSyncQueue = async (operation: Omit<SyncOperation, 'id' | 'timestamp'>) => {
  const id = crypto.randomUUID();
  const fullOperation: SyncOperation = {
    ...operation,
    id,
    timestamp: Date.now()
  };
  
  const existingQueue: SyncOperation[] = await syncQueueStore.getItem('queue') || [];
  existingQueue.push(fullOperation);
  await syncQueueStore.setItem('queue', existingQueue);
  
  // Try to sync immediately if online
  if (typeof window !== 'undefined' && navigator.onLine) {
    processSyncQueue();
  }
};

export const processSyncQueue = async () => {
  if (typeof window === 'undefined' || !navigator.onLine) return;
  
  const queue: SyncOperation[] = await syncQueueStore.getItem('queue') || [];
  if (queue.length === 0) return;

  const newQueue = [...queue];

  // We should process sequentially to maintain order
  for (const op of queue) {
    try {
      // In a real scenario, we'd have a switch here to hit the respective API endpoints
      // For now, we will log it. Next step is to implement the API calls per entity.
      let endpoint = `/api/${op.entity}s`;
      let method = op.action === 'create' ? 'POST' : op.action === 'update' ? 'PUT' : 'DELETE';
      
      // Basic fetch logic to be expanded
      await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' ? JSON.stringify(op.payload) : undefined
      });

      // Remove from queue on success
      const index = newQueue.findIndex(q => q.id === op.id);
      if (index !== -1) newQueue.splice(index, 1);
    } catch (error) {
      console.error(`Failed to sync operation ${op.id}`, error);
      // Stop processing if one fails, to keep order
      break; 
    }
  }

  await syncQueueStore.setItem('queue', newQueue);
};

// Listen to online event to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', processSyncQueue);
}
