import { INoteRepository } from '../repositories/interfaces/INoteRepository';

export class NoteService {
  constructor(private noteRepo: INoteRepository) {}

  async getNotes(workspaceId: string, folderId: string | null) {
    if (!workspaceId) throw new Error('Workspace ID is required');
    return await this.noteRepo.findNotesByWorkspace(workspaceId, folderId);
  }

  async createNoteWithTags(id: string, name: string, data: unknown, workspaceId: string, folderId: string | null, tagIds: string[]) {
    if (!id || !name || !workspaceId) throw new Error('Missing required fields');
    
    await this.noteRepo.createNote({ id, name, data, workspaceId, folderId });
    
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await this.noteRepo.assignTags(id, tagIds);
    }
  }

  async updateNote(id: string, data: { name?: string; data?: unknown; folderId?: string | null; workspaceId?: string; thumbnail?: string | null; extractedText?: string | null }) {
    await this.noteRepo.updateNote(id, data);
  }

  async deleteNote(id: string) {
    await this.noteRepo.deleteNote(id);
  }

  async updateNoteTags(noteId: string, tagIds: string[]) {
    await this.noteRepo.removeTags(noteId);
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await this.noteRepo.assignTags(noteId, tagIds);
    }
  }
}
