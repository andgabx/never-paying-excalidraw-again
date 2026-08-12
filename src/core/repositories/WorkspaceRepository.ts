import { db } from '@/db';
import { workspaces } from '@/db/schema';
import { IWorkspaceRepository } from './interfaces/IWorkspaceRepository';
import { eq, desc } from 'drizzle-orm';
import { Workspace } from '@/types';

export class WorkspaceRepository implements IWorkspaceRepository {
  async findAll(): Promise<Workspace[]> {
    return await db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
  }

  async create(data: { id: string; name: string }): Promise<Workspace> {
    const [newWs] = await db.insert(workspaces).values(data).returning();
    return newWs;
  }

  async update(id: string, data: { name: string }): Promise<Workspace> {
    const [updated] = await db.update(workspaces).set({ name: data.name }).where(eq(workspaces.id, id)).returning();
    return updated;
  }
}
