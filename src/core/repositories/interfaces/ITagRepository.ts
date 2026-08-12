import { Tag } from "../../../types";
export interface ITagRepository {
  findByWorkspace(workspaceId: string): Promise<Tag[]>;
  create(data: { id: string; name: string; color: string; workspaceId: string }): Promise<Tag>;
  update(id: string, data: { name?: string; color?: string }): Promise<Tag>;
  delete(id: string): Promise<void>;
}
