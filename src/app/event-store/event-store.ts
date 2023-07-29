import { EventEnvelope, PersistedEventEnvelope, StreamType } from "./types";
import { Pool } from "pg";


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
  const eventsStream: PersistedEventEnvelope<any>[] = []
  const versions: { [key: string]: number } = {}

  const getVersion = (streamType: StreamType, streamId: string) => versions[`${streamType}-${streamId}`] || 0

  const increamentVersion = (streamType: StreamType, streamId: string): void => {
    versions[`${streamType}-${streamId}`] = getVersion(streamType, streamId) + 1
  }

  const versionCheck = (streams: StreamEvents[]): void => {
    streams.forEach(({ events, expectedVersion, streamId, streamType}) => {
      const version = getVersion(streamType, streamId)
      if(version !== expectedVersion)
        throw new Error(`Version mismatch for stream ${streamType}-${streamId}. Expected ${expectedVersion} but was ${version}`)
    })
  }

  const appendStreams = async (streams: StreamEvents[]) => {
    versionCheck(streams)
    streams.forEach(({ events, streamId, streamType }) => {
      increamentVersion(streamType, streamId)
      events.forEach((event, index) => {
        eventsStream.push({
          eventType: event.eventType,
          metadata: event.metadata,
          payload: event.payload,
          position: `${streamType}-${streamId}-${index}`,
          streamId,
          streamType,
          timestamp: new Date(),
          version: getVersion(streamType, streamId)
        })
      })
    })
  }

  const readStream = async (streamId: string, streamType: StreamType): Promise<Array<PersistedEventEnvelope<any>>>  => {
    return eventsStream.filter(event => event.streamId === streamId && event.streamType === streamType) 
  }

  return {
    append: async(streamType: StreamType, streamId: string, expectedVersion: number, events: EventEnvelope[]) => 
      appendStreams([{ streamType, streamId, expectedVersion, events}]),
    appendStreams,
    readStream
  }
}

export const postgresEventStore = (pool: Pool): EventStore => {
  const appendStreams = async (streams: StreamEvents[]) => {}
  const readStream = async (streamId: string, streamType: StreamType): Promise<Array<PersistedEventEnvelope<any>>> => { return [] }

  return {
    append: async(streamType: StreamType, streamId: string, expectedVersion: number, events: EventEnvelope[]) => 
      appendStreams([{ streamType, streamId, expectedVersion, events}]),
    appendStreams,
    readStream
  }
}