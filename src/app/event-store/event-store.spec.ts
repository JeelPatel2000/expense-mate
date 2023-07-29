import { getTestDBPool } from '../utils/db';
import { EventStore, inMemoryEventStore, postgresEventStore } from './event-store'
import { StreamType } from './types';


const eventStoreTest = (eventStore: EventStore, timestamp: Date, teardown?: () => Promise<void>) => (): void => {
  afterAll(async () => {
    if(teardown)
      await teardown();
  })

  it(`given no events > when reading stream > then return empty array`, async () => {
    const events = await eventStore.readStream(`stream1`, StreamType.User)
    expect(events).toEqual([])
  })

  it(`given events > when append event > then appends event`, async () => {
    await eventStore.append(StreamType.Expense, `stream1`, 0, [{ eventType: 'Created', metadata: {}, payload: { eventType: `Created` } }])
    await eventStore.append(StreamType.Expense, `stream2`, 0, [{ eventType: 'Created', metadata: {}, payload: { eventType: `Created` } }])
    await eventStore.append(StreamType.Expense, `stream2`, 1, [{ eventType: 'Updated', metadata: {}, payload: { eventType: `Updated` } }])
    
    
    expect(await eventStore.readStream(`stream1`, StreamType.Expense)).
      toEqual([{ eventType: 'Created', metadata: {}, payload: { eventType: `Created` }, position: `1`, streamId: `stream1`, streamType: StreamType.Expense, timestamp, version: 1 }])
    expect(await eventStore.readStream(`stream2`, StreamType.Expense)).
      toEqual([
        { eventType: 'Created', metadata: {}, payload: { eventType: `Created` }, position: `2`, streamId: `stream2`, streamType: StreamType.Expense, timestamp, version: 1 },
        { eventType: 'Updated', metadata: {}, payload: { eventType: `Updated` }, position: `3`, streamId: `stream2`, streamType: StreamType.Expense, timestamp, version: 2 },
      ])
  })
}

describe('Event store tests', () => {
  const now = new Date()

  describe('In memory eventstore test', eventStoreTest(inMemoryEventStore(() => now), now))

  const pool = getTestDBPool()
  const teardown = async () => {
    const sql = `DELETE FROM eventstore`
    await pool.query(sql);
    await pool.end();
  }
  describe(`Postgres eventstore test`, eventStoreTest(postgresEventStore(pool), now, teardown))
})