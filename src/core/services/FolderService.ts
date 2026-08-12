import { IFolderRepository } from '../repositories/interfaces/IFolderRepository';

export class FolderService {
  constructor(private folderRepo: IFolderRepository) {}

  async getFoldersByWorkspace(workspaceId: string) {
    if (!workspaceId) throw new Error('Workspace ID is required');
    return await this.folderRepo.findByWorkspace(workspaceId);
  }

  async createFolder(name: string, workspaceId: string, parentId: string | null) {
    if (!name || !workspaceId) throw new Error('Name and Workspace ID are required');
    const id = crypto.randomUUID();
    return await this.folderRepo.create({ id, name, workspaceId, parentId });
  }

  async updateFolder(id: string, name?: string, parentId?: string | null, workspaceId?: string) {
    if (workspaceId) {
        await this.folderRepo.moveFolderToWorkspace(id, workspaceId, parentId);
        if (name) {
            await this.folderRepo.update(id, { name });
        }
        return null;
    }
    return await this.folderRepo.update(id, { name, parentId });
  }
}
