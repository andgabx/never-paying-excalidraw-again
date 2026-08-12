import { NextResponse } from 'next/server';
import { FolderRepository } from '@/core/repositories/FolderRepository';
import { FolderService } from '@/core/services/FolderService';

const repo = new FolderRepository();
const service = new FolderService(repo);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await service.updateFolder(id, body.name, body.parentId, body.workspaceId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
