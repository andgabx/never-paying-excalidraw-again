import axios from 'axios';
import { WorkspaceRepository } from '@/repositories/WorkspaceRepository';
import { workspaceStore, addToSyncQueue } from '@/lib/offlineStore';

export const workspaceRepository = new WorkspaceRepository(
  axios,
  workspaceStore,
  addToSyncQueue,
  () => typeof navigator !== 'undefined' ? navigator.onLine : true
);
