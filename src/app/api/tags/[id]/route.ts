import { NextResponse } from 'next/server';
import { TagRepository } from '@/core/repositories/TagRepository';
import { TagService } from '@/core/services/TagService';

const repo = new TagRepository();
const service = new TagService(repo);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, color } = await request.json();
    const updated = await service.updateTag(id, name, color);
    return NextResponse.json(updated || { success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await service.deleteTag(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
