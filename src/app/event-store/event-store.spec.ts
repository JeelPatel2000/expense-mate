import { getTestDBPool } from '../utils/db';
import { EventStore, StreamEvents, inMemoryEventStore, postgresEventStore } from './event-store'
import { EventEnvelope, StreamType } from './types';


const eventStoreTest = (eventStore: EventStore, timestamp: Date, teardown?: () => Promise<void>) => (): void => {
  afterAll(async () => {
    if(teardown)
      await teardown();
  })

  const givenEvent = (streamType: StreamType = StreamType.Expense, streamId: string = `stream-01`, expectedVersion: number = 0, events: EventEnvelope<any>[] = []): StreamEvents => {
    return {
      events,
      expectedVersion,
      streamId, 
      streamType
    }
  }

  it(`given no events > when reading stream > then return empty array`, async () => {
    const events = await eventStore.readStream(`stream1`, StreamType.User)
    expect(events).toStrictEqual([])
  })

  it(`given events > when append event > then appends event`, async () => {
    await eventStore.append(StreamType.Expense, `stream1`, 0, [{ eventType: 'Created', metadata: {}, payload: { eventType: `Created` } }])
    await eventStore.append(StreamType.Expense, `stream2`, 0, [{ eventType: 'Created', metadata: {}, payload: { eventType: `Created` } }])
    await eventStore.append(StreamType.Expense, `stream2`, 1, [{ eventType: 'Updated', metadata: {}, payload: { eventType: `Updated` } }])
    
    
    expect(await eventStore.readStream(`stream1`, StreamType.Expense)).
      toStrictEqual([{ eventType: 'Created', metadata: {}, payload: { eventType: `Created` }, position: `1`, streamId: `stream1`, streamType: StreamType.Expense, timestamp, version: 1 }])
    expect(await eventStore.readStream(`stream2`, StreamType.Expense)).
      toStrictEqual([
        { eventType: 'Created', metadata: {}, payload: { eventType: `Created` }, position: `2`, streamId: `stream2`, streamType: StreamType.Expense, timestamp, version: 1 },
        { eventType: 'Updated', metadata: {}, payload: { eventType: `Updated` }, position: `3`, streamId: `stream2`, streamType: StreamType.Expense, timestamp, version: 2 },
      ])
  })

  it(`given multiple event streams > when appenStreams > then appends streams`, async () => {
    const streams: StreamEvents[] = [
      givenEvent(StreamType.Expense, `expense-003`, 0, [{ eventType: `Created`, metadata: {}, payload: { eventType: `Created` }}]),
      givenEvent(StreamType.Expense, `expense-004`, 0, [{ eventType: `Updated`, metadata: {}, payload: { eventType: `Updated` }}]),
    ]
    await eventStore.appendStreams(streams)
    expect(await eventStore.readStream(`expense-003`, StreamType.Expense)).
      toStrictEqual([
        { eventType: 'Created', metadata: {}, payload: { eventType: `Created` }, position: `4`, streamId: `expense-003`, streamType: StreamType.Expense, timestamp, version: 1 }
      ])
    expect(await eventStore.readStream(`expense-004`, StreamType.Expense)).
      toStrictEqual([
        { eventType: 'Updated', metadata: {}, payload: { eventType: `Updated` }, position: `5`, streamId: `expense-004`, streamType: StreamType.Expense, timestamp, version: 1 }
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
  describe(`Postgres eventstore test`, eventStoreTest(postgresEventStore(pool, () => now), now, teardown))
})