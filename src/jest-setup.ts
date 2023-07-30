import { getTestDBPool } from "./app/utils/db"
import fs from 'fs'
import path from 'path'

export default async () => {
  const pool = getTestDBPool()
  


// Function to run a single migration file
async function runMigration(migrationFile: string) {
  const client = await pool.connect();

  try {
    const migrationSQL = fs.readFileSync(migrationFile, 'utf-8');
    await client.query(migrationSQL);
    console.log(`Migration '${path.basename(migrationFile)}' applied successfully.`);
  } catch (err) {
    console.error(`Error applying migration '${path.basename(migrationFile)}':`, err);
  } finally {
    client.release();
  }
}

// Function to apply all migrations
async function applyMigrations() {
  try {
    // Get the list of available migration files
    const migrationDir = path.join(__dirname, '..', 'flyway', 'migrations');
    console.log(migrationDir)
    const migrationFiles = fs.readdirSync(migrationDir).map((file) => path.join(migrationDir, file));

    // Sort migration files by name to apply them in order
    migrationFiles.sort();

    // Run migrations
    for (const migrationFile of migrationFiles) {
      await runMigration(migrationFile);
    }

    console.log('All migrations completed successfully.');
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1); // Exit with an error code to indicate test setup failure
  } finally {
    await pool.end();
  }
}

// Run migrations before the tests
await applyMigrations();

}
