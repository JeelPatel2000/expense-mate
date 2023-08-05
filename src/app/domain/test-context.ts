import { EventStore } from "../event-store/event-store"
import { EventEnvelope, Metadata, StreamType } from "../event-store/types"
import { ExpenseCreatedEvent, ExpenseDeletedEvent, ExpenseEvent, ExpenseEventType, ExpenseRestoredEvent, ExpenseUpdatedEvent } from "./expense/types"

interface ExpenseTestContect {
  given: {
    created: (params: Omit<ExpenseCreatedEvent, 'eventType'>, metadata?: Metadata) => Promise<void>
    updated: (params: Omit<ExpenseUpdatedEvent, 'eventType'>, metadata?: Metadata) => Promise<void>
    deleted: (params: Omit<ExpenseDeletedEvent, 'eventType'>, metadata?: Metadata) => Promise<void>
    restored: (params: Omit<ExpenseRestoredEvent, 'eventType'>, metadata?: Metadata) => Promise<void>
  }
  then: {
    created: (params: Omit<ExpenseCreatedEvent, 'eventType'>, metadata?: Metadata) => Promise<void>
    updated: (params: Omit<ExpenseUpdatedEvent, 'eventType'>, metadata?: Metadata) => Promise<void>
    deleted: (params: Omit<ExpenseDeletedEvent, 'eventType'>, metadata?: Metadata) => Promise<void>
    restored: (params: Omit<ExpenseRestoredEvent, 'eventType'>, metadata?: Metadata) => Promise<void>
    noEvent: () => Promise<void>
  }
}

export const testContext = (eventStore: EventStore, aggregateId: string): ExpenseTestContect => {

  const streamVerion: { [key: string]: number } = {}
  const getVersion = (streamType: StreamType, streamId: string) => streamVerion[`${streamType}-${streamId}`] || 0
  const increatementVersion = (streamType: StreamType, streamId: string) => {
    const key = `${streamType}-${streamId}`
    streamVerion[key] = getVersion(streamType, streamId) + 1
  }

  const givenEvent = async (streamType: StreamType, aggregateId: string, payload: ExpenseEvent, metadata: Metadata = {}): Promise<void> => {
    const eventEnvelope: EventEnvelope = {
      eventType: payload.eventType,
      metadata,
      payload
    }
    const version = getVersion(streamType, aggregateId);
    await eventStore.append(streamType, aggregateId, version, [eventEnvelope]);
    increatementVersion(streamType, aggregateId);
  }

  const thenEvent = async (streamType: StreamType, aggregateId: string, payload: ExpenseEvent, metadata: Metadata = {}) => {
    const events = await eventStore.readStream<ExpenseEvent>(aggregateId, streamType)
    const version = getVersion(streamType, aggregateId)
    const event = events[version]
    expect(event.eventType).toBe(payload.eventType)
    expect(event.payload).toBe(payload)
    expect(event.metadata).toBe(metadata)
    increatementVersion(streamType, aggregateId)
  }

  const noEvent = async (streamType: StreamType, aggregateId: string) => {
    const events = await eventStore.readStream<ExpenseEvent>(aggregateId, streamType)
    const version = getVersion(streamType, aggregateId)
    expect(events.slice(version).length).toBe(0)
  }

  return {
    given: {
      created: async (params, metadata) => givenEvent(StreamType.Expense, aggregateId, { ...params, eventType: ExpenseEventType.Created }, metadata),
      updated: async (params, metadata) => givenEvent(StreamType.Expense, aggregateId, { ...params, eventType: ExpenseEventType.Updated }, metadata),
      deleted: async (params, metadata) => givenEvent(StreamType.Expense, aggregateId, { ...params, eventType: ExpenseEventType.Deleted }, metadata),
      restored: async (params, metadata) => givenEvent(StreamType.Expense, aggregateId, { ...params, eventType: ExpenseEventType.Restored }, metadata),
    },
    then: {
      created: async (params, metadata) => thenEvent(StreamType.Expense, aggregateId, { ...params, eventType: ExpenseEventType.Created }, metadata),
      updated: async (params, metadata) => thenEvent(StreamType.Expense, aggregateId, { ...params, eventType: ExpenseEventType.Updated }, metadata),
      deleted: async (params, metadata) => thenEvent(StreamType.Expense, aggregateId, { ...params, eventType: ExpenseEventType.Deleted }, metadata),
      restored: async (params, metadata) => thenEvent(StreamType.Expense, aggregateId, { ...params, eventType: ExpenseEventType.Restored }, metadata),
      noEvent: async () => noEvent(StreamType.Expense, aggregateId)
    }
  }
}