import { db } from '@/db';
import { folders, notes } from '@/db/schema';
import { IFolderRepository } from './interfaces/IFolderRepository';
import { eq, desc, inArray } from 'drizzle-orm';
import { Folder } from "@/types";

export class FolderRepository implements IFolderRepository {
  async findByWorkspace(workspaceId: string): Promise<Folder[]> {
    return await db.select().from(folders)
      .where(eq(folders.workspaceId, workspaceId))
      .orderBy(desc(folders.createdAt));
  }

  async create(data: { id: string; name: string; workspaceId: string; parentId: string | null }): Promise<Folder> {
    const [newFolder] = await db.insert(folders).values(data).returning();
    return newFolder;
  }

  async update(id: string, data: { name?: string; parentId?: string | null; workspaceId?: string }): Promise<Folder> {
    const [updated] = await db.update(folders).set(data).where(eq(folders.id, id)).returning();
    return updated as Folder;
  }

  async moveFolderToWorkspace(folderId: string, newWorkspaceId: string, targetFolderId: string | null = null): Promise<void> {
    const [currentFolder] = await db.select().from(folders).where(eq(folders.id, folderId));
    if (!currentFolder) return;
    
    const allFolders = await db.select().from(folders).where(eq(folders.workspaceId, currentFolder.workspaceId));
    const descendants: string[] = [folderId];
    
    const findChildren = (id: string) => {
      const children = allFolders.filter(f => f.parentId === id);
      for (const child of children) {
        descendants.push(child.id);
        findChildren(child.id);
      }
    };
    findChildren(folderId);
    
    await db.update(folders).set({ workspaceId: newWorkspaceId }).where(inArray(folders.id, descendants));
    await db.update(folders).set({ parentId: targetFolderId }).where(eq(folders.id, folderId));
    await db.update(notes).set({ workspaceId: newWorkspaceId }).where(inArray(notes.folderId, descendants));
  }
}
