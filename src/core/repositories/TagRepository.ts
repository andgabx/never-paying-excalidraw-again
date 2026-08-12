import { db } from '@/db';
import { tags } from '@/db/schema';
import { ITagRepository } from './interfaces/ITagRepository';
import { eq, desc } from 'drizzle-orm';
import { Tag } from '@/types';

export class TagRepository implements ITagRepository {
  async findByWorkspace(workspaceId: string): Promise<Tag[]> {
    return await db.select().from(tags)
      .where(eq(tags.workspaceId, workspaceId))
      .orderBy(desc(tags.createdAt));
  }

  async create(data: { id: string; name: string; color: string; workspaceId: string }): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(data).returning();
    return newTag;
  }

  async update(id: string, data: { name?: string; color?: string }): Promise<Tag> {
    const [updated] = await db.update(tags).set(data).where(eq(tags.id, id)).returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.delete(tags).where(eq(tags.id, id));
  }
}
