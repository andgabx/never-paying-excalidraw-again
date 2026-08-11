import DashboardClient from './components/DashboardClient';
import { db } from '../db';
import { workspaces } from '../db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const allWorkspaces = await db.select().from(workspaces).orderBy(desc(workspaces.createdAt));

  return <DashboardClient initialWorkspaces={allWorkspaces} />;
}
