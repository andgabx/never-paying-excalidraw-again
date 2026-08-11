import { db } from './index';
import { workspaces, notes } from './schema';
import { isNull } from 'drizzle-orm';

async function main() {
  console.log('Seeding default workspace...');
  const defaultWorkspaceId = crypto.randomUUID();
  
  await db.insert(workspaces).values({
    id: defaultWorkspaceId,
    name: 'Meu Workspace',
  });
  
  console.log(`Default workspace created: ${defaultWorkspaceId}`);
  
  // Move all notes without a workspace to this default workspace
  const updated = await db.update(notes)
    .set({ workspaceId: defaultWorkspaceId })
    .where(isNull(notes.workspaceId))
    .returning();
    
  console.log(`Moved ${updated.length} notes to the default workspace.`);
}

main().catch(console.error);
