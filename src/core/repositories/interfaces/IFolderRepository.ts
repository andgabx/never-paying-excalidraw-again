import { Folder } from "../../../types";
export interface IFolderRepository {
  findByWorkspace(workspaceId: string): Promise<Folder[]>;
  create(data: { id: string; name: string; workspaceId: string; parentId: string | null }): Promise<Folder>;
  update(id: string, data: { name?: string; parentId?: string | null; workspaceId?: string }): Promise<Folder>;
  moveFolderToWorkspace(folderId: string, newWorkspaceId: string, targetFolderId?: string | null): Promise<void>;
}
