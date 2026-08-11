import { NextResponse } from 'next/server';
import { db } from '@/db';
import { folders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // We can update name or parentId
    const updates: Partial<{ name: string; parentId: string | null }> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.parentId !== undefined) updates.parentId = body.parentId;

    await db.update(folders).set(updates).where(eq(folders.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 });
  }
}
