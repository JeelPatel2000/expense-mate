import { EventEnvelope, PersistedEventEnvelope, StreamType } from "./types";

export interface StreamEvents {
  streamType: StreamType
  streamId: string
  expectedVersion: number
  events: EventEnvelope[]
}

export interface EventStore {
  append: (streamType: StreamType, streamId: string, expectedVersion: number, events: EventEnvelope[]) => Promise<void>
  appendStreams: (streams: StreamEvents[]) => Promise<void>
  readStream: <T>(streamId: string, streamType: StreamType) => Promise<Array<PersistedEventEnvelope<T>>>
}

export const inMemoryEventStore = (): EventStore => {

  const append = async (streamType: StreamType, streamId: string, expectedVersion: number, events: EventEnvelope[]) => {
    return
  }

  const appendStreams = async (streams: StreamEvents[]) => {
    return
  }

  const readStream = async (streamId: string, streamType: StreamType): Promise<Array<PersistedEventEnvelope<any>>>  => {
    const result: Array<PersistedEventEnvelope<any>> = []
    return result
  }


  return {
    append,
    appendStreams,
    readStream
  }
}