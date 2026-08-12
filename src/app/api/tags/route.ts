import { NextResponse } from 'next/server';
import { TagRepository } from '@/core/repositories/TagRepository';
import { TagService } from '@/core/services/TagService';

const repo = new TagRepository();
const service = new TagService(repo);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const data = await service.getTagsByWorkspace(workspaceId as string);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, color, workspaceId } = await request.json();
    const newTag = await service.createTag(name, color, workspaceId);
    return NextResponse.json(newTag);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
