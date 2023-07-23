export interface EventEnvelope<T = any> {
  eventType: string
  metadata: Metadata
  payload: T
}

export interface PersistedEventEnvelope<T = any> extends EventEnvelope<T> {
  position: string
  version: number
  streamType: StreamType
  streamId: string
  timestamp: Date
}

export interface Aggregate {
	aggregateId: string
	unpublishedEnvelopes: () => number
  commitedVersion: () => number
  uncommitedVersion: () => number
  load: (envelopes: PersistedEventEnvelope[]) => void
}

export interface Metadata {
  [key: string]: any
}

export enum StreamType {
  User = `User`,
  Expense = `Expense`,
  Group = `Group`
}

export interface Repository<T extends Aggregate> {
  save(aggregate: T): Promise<void>
  load(aggregateId: string): Promise<T>
}