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
