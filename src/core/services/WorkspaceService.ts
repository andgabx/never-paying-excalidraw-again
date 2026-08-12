import { IWorkspaceRepository } from '../repositories/interfaces/IWorkspaceRepository';

export class WorkspaceService {
  constructor(private workspaceRepo: IWorkspaceRepository) {}

  async getAllWorkspaces() {
    return await this.workspaceRepo.findAll();
  }

  async createWorkspace(name: string) {
    if (!name) throw new Error('Name is required');
    const id = crypto.randomUUID();
    return await this.workspaceRepo.create({ id, name } as any);
  }

  async renameWorkspace(id: string, name: string) {
    if (!name) throw new Error('Name is required');
    return await this.workspaceRepo.update(id, { name });
  }
}
