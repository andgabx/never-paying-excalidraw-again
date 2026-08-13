export type Workspace = { id: string; name: string; };
export type Folder = { id: string; name: string; workspaceId: string; parentId: string | null; };
export type Tag = { id: string; name: string; color: string; workspaceId: string; };
export type NoteTag = { id: string; name: string; color: string; };
export type Note = {
  id: string; 
  name: string; 
  folderId: string | null; 
  workspaceId: string;
  createdAt: string | Date; 
  updatedAt: string | Date; 
  tags: NoteTag[];
  data?: any;
  thumbnail?: string | null;
};
