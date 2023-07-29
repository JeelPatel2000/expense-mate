import { StreamEvents } from "./event-store"

export const selectVersionsSqlQuery = (streams: StreamEvents[]): { sql: string, values: any[]} => {
  const whereClauses: Array<string> = []
  const values: Array<any> = []
  let value = 0;

  for (const {streamId, streamType} of streams) {
    values.push(streamType, streamId)
    whereClauses.push(`(stream_type = $${++value} AND stream_id = $${++value})`)
  }

  return {
    sql: `SELECT stream_type, stream_id, MAX(version) as version FROM eventstore WHERE ${whereClauses.join(` OR `)} GROUP BY stream_type, stream_id`,
    values
  }
}

export const insertRowsSqlQuery = (streams: StreamEvents[], now: () => Date): { sql: string, values: any[] } => {
  const valueRows: Array<string> = []
  const values: Array<any> = []
  let value = 0

  for (const {events, expectedVersion, streamId, streamType} of streams) {
    for (const {eventType, metadata, payload} of events) {
      let commitedVersion = expectedVersion + 1
      valueRows.push(`($${++value}, $${++value}, $${++value}, $${++value}, $${++value}::jsonb, $${++value}::jsonb, $${++value} at time zone 'utc')`)
      values.push(streamType, streamId, commitedVersion, eventType, payload, metadata, now())
    }
  }

  return {
    sql: `INSERT INTO eventstore (stream_type, stream_id, version, event_type, payload, metadata, timestamp) VALUES ${valueRows.join(`, `)}`,
    values
  }
}