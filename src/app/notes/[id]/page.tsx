import DynamicNoteWrapper from './DynamicNoteWrapper';
import { db } from '../../../db';
import { notes } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const fetchedNotes = await db.select().from(notes).where(eq(notes.id, id));
  const note = fetchedNotes[0];

  if (!note) {
    notFound();
  }

  return <DynamicNoteWrapper initialNote={note as any} />;
}
