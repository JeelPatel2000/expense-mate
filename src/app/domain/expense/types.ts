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
  updatedByUser: string
}

export interface ExpenseDeletedEvent {
  eventType: ExpenseEventType.Deleted
  deletedByUser: string
}

export interface ExpenseRestoredEvent {
  eventType: ExpenseEventType.Restored
  restoredByUser: string
}

export type ExpenseEvent = ExpenseCreatedEvent | ExpenseUpdatedEvent | ExpenseDeletedEvent | ExpenseRestoredEvent

export enum ExpenseEventType {
  Created = `Created`,
  Updated = `Updated`,
  Deleted = `Deleted`,
  Restored = `Restored`
}