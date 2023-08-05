import { StreamEvents } from "./event-store"
import { insertRowsSqlQuery, readStreamSqlQuery, selectVersionsSqlQuery } from "./helpers"
import { StreamType } from "./types"

describe(`helpers test suite`, () => {
    const now = new Date()
    const givenEvents = (): Array<StreamEvents> => [
        {
            streamType: StreamType.Expense,
            streamId: `expense-001`,
            expectedVersion: 0,
            events: [
                {
                    eventType: 'Created',
                    metadata: {},
                    payload: {
                        eventType: 'Created'
                    }
                }
            ]
        },
        {
            streamType: StreamType.Expense,
            streamId: `expense-001`,
            expectedVersion: 1,
            events: [
                {
                    eventType: 'Updated',
                    metadata: {},
                    payload: {
                        eventType: 'Updated'
                    }
                }
            ]
        }
    ] 

    it(`given multiple events > when select versions query > then returns valid sql and values`, () => {
        const { sql, values } = selectVersionsSqlQuery(givenEvents())
        expect(sql).toBe(`SELECT stream_type, stream_id, MAX(version) as version FROM eventstore WHERE (stream_type = $1 AND stream_id = $2) OR (stream_type = $3 AND stream_id = $4) GROUP BY stream_type, stream_id`)
        expect(values).toStrictEqual([`Expense`, `expense-001`, `Expense`, `expense-001`])
    })

    it(`given multiple events to insert > when insert sql query > then returns valid sql and values`, () => {
        const { sql, values } = insertRowsSqlQuery(givenEvents(), now)
        expect(sql).toBe(`INSERT INTO eventstore (stream_type, stream_id, version, event_type, payload, metadata, timestamp) VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7 at time zone 'utc'), ($8, $9, $10, $11, $12::jsonb, $13::jsonb, $14 at time zone 'utc')`)
        expect(values).toStrictEqual([`Expense`, `expense-001`, 1, `Created`, {eventType: 'Created'}, {}, now, `Expense`, `expense-001`, 2, `Updated`, {eventType: 'Updated'}, {}, now])
    })

    it(`given events in eventstore > when read stream sql query > then returns valid sql query`, () => {
        const { sql } = readStreamSqlQuery(`expense-001`, StreamType.Expense)
        expect(sql).toBe(`SELECT position, stream_type, stream_id, version, event_type, payload, metadata, timestamp at time zone 'utc' as timestamp FROM eventstore WHERE stream_type = 'Expense' AND stream_id = 'expense-001' ORDER BY position ASC`)
    })
})