import { NextResponse } from 'next/server';
import { NoteRepository } from '@/core/repositories/NoteRepository';
import { NoteService } from '@/core/services/NoteService';

const repo = new NoteRepository();
const service = new NoteService(repo);

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if updating only tags
    if (body.tagIds !== undefined && Object.keys(body).length === 1) {
      console.log('Updating tags only:', body.tagIds);
      await service.updateNoteTags(id, body.tagIds);
    } else {
      console.log('Updating note data. Body keys:', Object.keys(body));
      if (body.data) {
        console.log('Data size being saved:', JSON.stringify(body.data).length, 'bytes');
      }
      await service.updateNote(id, body);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await service.deleteNote(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
