import { EventStore, inMemoryEventStore } from './event-store'
import { EventEnvelope, PersistedEventEnvelope, StreamType } from './types';


const eventStoreTest = (eventStore: EventStore, teardown?: () => Promise<void>) => (): void => {
  afterAll(async () => {
    if(teardown)
      await teardown();
  })

  it('passing test', () => {
    expect(true).toBe(true)
  })
  
}

describe('Event store tests', () => {

  describe('In memory eventstore test', eventStoreTest(inMemoryEventStore()))

  
})