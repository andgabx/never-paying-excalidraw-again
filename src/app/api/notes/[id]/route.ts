import { NextResponse } from 'next/server';
import { db } from '@/db';
import { notes } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const note = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    
    if (note.length === 0) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json(note[0]);
  } catch (error) {
    console.error('Failed to fetch note:', error);
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, name } = body;
    
    if (data === undefined && name === undefined) {
      return NextResponse.json({ error: 'Missing data or name' }, { status: 400 });
    }

    const updatePayload: Partial<typeof notes.$inferInsert> = { updatedAt: new Date() };
    if (data !== undefined) updatePayload.data = data;
    if (name !== undefined) updatePayload.name = name;

    await db.update(notes)
      .set(updatePayload)
      .where(eq(notes.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.delete(notes).where(eq(notes.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
