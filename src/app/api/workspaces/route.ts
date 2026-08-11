import { NextResponse } from 'next/server';
import { db } from '@/db';
import { workspaces } from '@/db/schema';
import { desc } from 'drizzle-orm';
import crypto from 'crypto';

export async function GET() {
  try {
    const allWorkspaces = await db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
    return NextResponse.json(allWorkspaces);
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json({ error: 'Missing name' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await db.insert(workspaces).values({
      id,
      name,
    });

    return NextResponse.json({ id, name });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}
