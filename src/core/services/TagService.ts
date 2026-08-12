import { ITagRepository } from '../repositories/interfaces/ITagRepository';

export class TagService {
  constructor(private tagRepo: ITagRepository) {}

  async getTagsByWorkspace(workspaceId: string) {
    if (!workspaceId) throw new Error('Workspace ID is required');
    return await this.tagRepo.findByWorkspace(workspaceId);
  }

  async createTag(name: string, color: string, workspaceId: string) {
    if (!name || !color || !workspaceId) throw new Error('Name, color, and workspace ID are required');
    const id = crypto.randomUUID();
    return await this.tagRepo.create({ id, name, color, workspaceId });
  }

  async updateTag(id: string, name?: string, color?: string) {
    if (!name && !color) throw new Error('Nothing to update');
    return await this.tagRepo.update(id, { name, color });
  }

  async deleteTag(id: string) {
    return await this.tagRepo.delete(id);
  }
}
