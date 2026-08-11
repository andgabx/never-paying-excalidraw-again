import { NextResponse } from 'next/server';
import { db } from '@/db';
import { notes } from '@/db/schema';
import { desc, eq, and, isNull } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const folderId = searchParams.get('folderId');
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    let query;
    if (folderId) {
      query = db.select({ id: notes.id, name: notes.name, updatedAt: notes.updatedAt, folderId: notes.folderId, workspaceId: notes.workspaceId })
        .from(notes)
        .where(and(eq(notes.workspaceId, workspaceId), eq(notes.folderId, folderId)))
        .orderBy(desc(notes.updatedAt));
    } else {
      query = db.select({ id: notes.id, name: notes.name, updatedAt: notes.updatedAt, folderId: notes.folderId, workspaceId: notes.workspaceId })
        .from(notes)
        .where(and(eq(notes.workspaceId, workspaceId), isNull(notes.folderId)))
        .orderBy(desc(notes.updatedAt));
    }

    const allNotes = await query;
    return NextResponse.json(allNotes);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, data, workspaceId, folderId } = body;
    
    if (!id || !name || !data || !workspaceId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db.insert(notes).values({
      id,
      name,
      data,
      workspaceId,
      folderId: folderId || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
