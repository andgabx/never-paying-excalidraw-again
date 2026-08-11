import DashboardClient from './components/DashboardClient';
import { db } from '../db';
import { notes } from '../db/schema';

// This is a Server Component. It fetches data directly from the DB on the server.
export const dynamic = 'force-dynamic'; // Ensure it fetches fresh data

export default async function Home() {
  const allNotes = await db.select().from(notes);

  return <DashboardClient initialNotes={allNotes} />;
}
