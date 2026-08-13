import { Note } from "../../../types";
export interface INoteRepository {
  findNotesByWorkspace(workspaceId: string, folderId: string | null): Promise<Note[]>;
  createNote(data: { id: string; name: string; data: unknown; workspaceId: string; folderId: string | null }): Promise<void>;
  updateNote(id: string, data: { name?: string; data?: unknown; folderId?: string | null; workspaceId?: string; thumbnail?: string | null; extractedText?: string | null }): Promise<void>;
  deleteNote(id: string): Promise<void>;
  assignTags(noteId: string, tagIds: string[]): Promise<void>;
  removeTags(noteId: string): Promise<void>;
}
