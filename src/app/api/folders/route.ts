import { NextResponse } from 'next/server';
import { db } from '@/db';
import { folders } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 });
    }

    const workspaceFolders = await db.select().from(folders).where(eq(folders.workspaceId, workspaceId)).orderBy(desc(folders.createdAt));
    return NextResponse.json(workspaceFolders);
  } catch (error) {
    console.error('Failed to fetch folders:', error);
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, workspaceId } = body;
    
    if (!name || !workspaceId) {
      return NextResponse.json({ error: 'Missing name or workspaceId' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await db.insert(folders).values({
      id,
      name,
      workspaceId,
    });

    return NextResponse.json({ id, name, workspaceId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
