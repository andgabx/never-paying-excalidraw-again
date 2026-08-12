import { db } from '@/db';
import { notes, noteTags, tags } from '@/db/schema';
import { INoteRepository } from './interfaces/INoteRepository';
import { eq, and, isNull, inArray, desc } from 'drizzle-orm';
import { Note } from '@/types';

export class NoteRepository implements INoteRepository {
  async findNotesByWorkspace(workspaceId: string, folderId: string | null): Promise<Note[]> {
    let query: any = db.select({ id: notes.id, name: notes.name, createdAt: notes.createdAt, updatedAt: notes.updatedAt, folderId: notes.folderId, workspaceId: notes.workspaceId })
      .from(notes);
      
    if (folderId) {
      query = query.where(and(eq(notes.workspaceId, workspaceId), eq(notes.folderId, folderId)));
    } else {
      query = query.where(and(eq(notes.workspaceId, workspaceId), isNull(notes.folderId)));
    }
    
    query = query.orderBy(desc(notes.updatedAt));
    const allNotes = await query as unknown as { id: string; name: string; createdAt: Date; updatedAt: Date; folderId: string | null; workspaceId: string }[];
    
    const noteIds = allNotes.map(n => n.id);
    let noteTagsMap: Record<string, any[]> = {};
    
    if (noteIds.length > 0) {
      const tagsForNotes = await db.select({ noteId: noteTags.noteId, id: tags.id, name: tags.name, color: tags.color })
        .from(noteTags)
        .innerJoin(tags, eq(noteTags.tagId, tags.id))
        .where(inArray(noteTags.noteId, noteIds));

      noteTagsMap = tagsForNotes.reduce((acc: Record<string, unknown[]>, curr: { noteId: string; id: string; name: string; color: string }) => {
        if (!acc[curr.noteId]) acc[curr.noteId] = [];
        acc[curr.noteId].push({ id: curr.id, name: curr.name, color: curr.color });
        return acc;
      }, {});
    }

    return allNotes.map((n: any) => ({ ...n, tags: noteTagsMap[n.id] || [] })) as Note[];
  }

  async createNote(data: { id: string; name: string; data: unknown; workspaceId: string; folderId: string | null }): Promise<void> {
    await db.insert(notes).values(data);
  }

  async updateNote(id: string, data: { name?: string; data?: unknown; folderId?: string | null; workspaceId?: string }): Promise<void> {
    await db.update(notes).set({ ...data, updatedAt: new Date() }).where(eq(notes.id, id));
  }

  async deleteNote(id: string): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  async assignTags(noteId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;
    await db.insert(noteTags).values(tagIds.map(tagId => ({ noteId, tagId })));
  }

  async removeTags(noteId: string): Promise<void> {
    await db.delete(noteTags).where(eq(noteTags.noteId, noteId));
  }
}
