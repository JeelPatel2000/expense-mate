import { insertRowsSqlQuery, readStreamSqlQuery, selectVersionsSqlQuery } from "./helpers";
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

export const inMemoryEventStore = (now: () => Date = () => new Date()): EventStore => {
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
      events.forEach((event) => {
        eventsStream.push({
          eventType: event.eventType,
          metadata: event.metadata,
          payload: event.payload,
          position: (eventsStream.length + 1).toString(),
          streamId,
          streamType,
          timestamp: now(),
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

export const postgresEventStore = (pool: Pool, now: () => Date = () => new Date()): EventStore => {

  const versionKey = (streamType: StreamType, streamId: string) => `${streamType}-${streamId}`

  const checkVersion = async (streams: StreamEvents[]) => {
    const { sql, values } =  selectVersionsSqlQuery(streams)
    const { rows } = await pool.query<{ stream_type: StreamType, stream_id: string, version: number}>(sql, values);
    const versions: Map<string, number> = new Map();
    rows.forEach(row => {
      versions.set(versionKey(row.stream_type, row.stream_id), row.version)
    });
    streams.forEach(({streamId, streamType, expectedVersion}) => {
      const version = versions.get(versionKey(streamType, streamId)) ?? 0
      if(expectedVersion !== version) 
        throw new Error(`Version mismatch for stream ${streamType}-${streamId}. Expected ${expectedVersion} but was ${version}`)
    })
  }


  const appendStreams = async (streams: StreamEvents[]) => {
    await checkVersion(streams)
    const { sql, values } = insertRowsSqlQuery(streams, now())
    try {
      await pool.query('BEGIN')
      await pool.query(sql, values)
      await pool.query('COMMIT')
    }
    catch(e){
      console.log(e, 'Database error while inserting rows')
      await pool.query('ROLLBACK')
    }
  }

  const readStream = async (streamId: string, streamType: StreamType): Promise<Array<PersistedEventEnvelope<any>>> => {
    const { sql } = readStreamSqlQuery(streamId, streamType);
    const { rows } = await pool.query(sql);
    return mapRows(rows)
  }

  const mapRows = <T>(rows: any[]): Array<PersistedEventEnvelope<T>> => rows.map(row => {
    console.log(row.timestamp)
    return {
      position: row.position,
      streamType: row.stream_type,
      streamId: row.stream_id,
      version: row.version,
      eventType: row.event_type,
      payload: row.payload,
      metadata: row.metadata,
      timestamp: row.timestamp
    }
  })
  
  return {
    append: async(streamType: StreamType, streamId: string, expectedVersion: number, events: EventEnvelope[]) => 
      appendStreams([{ streamType, streamId, expectedVersion, events}]),
    appendStreams,
    readStream
  }
}