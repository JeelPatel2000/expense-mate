import { getTestDBPool } from "./app/utils/db"
import path from 'path'
import fs from 'fs'

export default async () => {
  const pool = getTestDBPool()

  async function teardown() {
    try {
      const fileName = path.join(__dirname, '..', 'flyway', 'teardown.sql');
      const migrationSQL = fs.readFileSync(fileName, 'utf-8').toString();
      // Run migrations
      const client = await pool.connect();

      try {
        await client.query(migrationSQL);
        console.log(`Migration '${path.basename(fileName)}' applied successfully.`);
      } catch (err) {
        console.error(`Error applying migration '${path.basename(fileName)}':`, err);
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Error running migrations:', err);
      process.exit(1); // Exit with an error code to indicate test setup failure
    } finally {
      await pool.end();
    }
  }

  await teardown()
}