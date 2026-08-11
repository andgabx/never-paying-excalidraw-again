import { NextResponse } from 'next/server';
import { db } from '@/db';
import { notes } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allNotes = await db.select({ id: notes.id, name: notes.name, updatedAt: notes.updatedAt }).from(notes).orderBy(desc(notes.updatedAt));
    return NextResponse.json(allNotes);
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, data } = body;
    
    if (!id || !name || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await db.insert(notes).values({
      id,
      name,
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
