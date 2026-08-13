import { NextResponse } from 'next/server';
import { NoteRepository } from '@/core/repositories/NoteRepository';
import { NoteService } from '@/core/services/NoteService';

const repo = new NoteRepository();
const service = new NoteService(repo);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const folderId = searchParams.get('folderId') || null;
    const search = searchParams.get('search');
    const scope = searchParams.get('scope');

    if (search) {
      if (scope === 'workspace') {
        const data = await service.searchNotes(search, workspaceId as string);
        return NextResponse.json(data);
      } else if (scope === 'folder') {
        const data = await service.searchNotes(search, workspaceId as string, folderId);
        return NextResponse.json(data);
      } else {
        // scope === 'global' or undefined
        const data = await service.searchNotes(search);
        return NextResponse.json(data);
      }
    }

    const data = await service.getNotes(workspaceId as string, folderId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, name, data, workspaceId, folderId, tagIds } = await request.json();
    await service.createNoteWithTags(id, name, data, workspaceId, folderId || null, tagIds || []);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
