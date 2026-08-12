import { NextResponse } from 'next/server';
import { WorkspaceRepository } from '@/core/repositories/WorkspaceRepository';
import { WorkspaceService } from '@/core/services/WorkspaceService';

const repo = new WorkspaceRepository();
const service = new WorkspaceService(repo);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    const updated = await service.renameWorkspace(id, name);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
