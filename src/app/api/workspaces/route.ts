import { NextResponse } from 'next/server';
import { WorkspaceRepository } from '@/core/repositories/WorkspaceRepository';
import { WorkspaceService } from '@/core/services/WorkspaceService';

const repo = new WorkspaceRepository();
const service = new WorkspaceService(repo);

export async function GET() {
  try {
    const data = await service.getAllWorkspaces();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const newWs = await service.createWorkspace(name);
    return NextResponse.json(newWs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
