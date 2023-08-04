export interface ExpenseCreatedEvent {
  eventType: ExpenseEventType.Created
  description: string
  amount: number
  date: Date
  createdByUserId: string
  belongsToGroupId: string
}

export interface ExpenseUpdatedEvent {
  eventType: ExpenseEventType.Updated
  updatedByUserId: string
  description: string
  amount: number
}

export interface ExpenseDeletedEvent {
  eventType: ExpenseEventType.Deleted
  deletedByUserId: string
}

export interface ExpenseRestoredEvent {
  eventType: ExpenseEventType.Restored
  restoredByUserId: string
}

export type ExpenseEvent = ExpenseCreatedEvent | ExpenseUpdatedEvent | ExpenseDeletedEvent | ExpenseRestoredEvent

export enum ExpenseEventType {
  Created = `Created`,
  Updated = `Updated`,
  Deleted = `Deleted`,
  Restored = `Restored`
}