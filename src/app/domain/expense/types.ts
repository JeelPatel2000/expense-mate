import { GroupAggregate } from "../group/aggregate"
import { UserAggregate } from "../user/aggregate"

export interface ExpenseCreatedEvent {
  eventType: ExpenseEventType.Created
  description: string
  amount: number
  date: Date
  createdBy: UserAggregate
  belongsTo: GroupAggregate
  metadata: {}
}

export interface ExpenseUpdatedEvent {
  eventType: ExpenseEventType.Updated
  updatedBy: UserAggregate
  metadata: {}
}

export interface ExpenseDeletedEvent {
  eventType: ExpenseEventType.Deleted
  deletedBy: UserAggregate
  metadata: {}
}

export interface ExpenseRestoredEvent {
  eventType: ExpenseEventType.Restored
  restoredBy: UserAggregate
  metadata: {}
}

export type ExpenseEvent = ExpenseCreatedEvent | ExpenseUpdatedEvent | ExpenseDeletedEvent | ExpenseRestoredEvent

export enum ExpenseEventType {
  Created = `Created`,
  Updated = `Updated`,
  Deleted = `Deleted`,
  Restored = `Restored`
}