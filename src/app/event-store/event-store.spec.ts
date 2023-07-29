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

  it(`given an event > when append event > then appends event`, async () => {
    await eventStore.append(StreamType.Expense, `stream1`, 0, [{ eventType: 'Created', metadata: {}, payload: { eventType: `Created` } }])
    expect(await eventStore.readStream(`stream1`, StreamType.Expense)).
      toEqual([{ eventType: 'Created', metadata: {}, payload: { eventType: `Created` }, position: `1`, streamId: `stream1`, streamType: StreamType.Expense, timestamp, version: 1 }])
  })
}

describe('Event store tests', () => {
  const now = new Date()

  describe('In memory eventstore test', eventStoreTest(inMemoryEventStore(() => now), now))

  const pool = getTestDBPool()
  describe(`Postgres eventstore test`, eventStoreTest(postgresEventStore(pool), now))
})