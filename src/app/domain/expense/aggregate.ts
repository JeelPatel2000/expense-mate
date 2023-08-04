import { Aggregate, EventEnvelope, Metadata, PersistedEventEnvelope, StreamType } from "../../event-store/types";
import { DomainError } from "../types";
import { ExpenseEvent, ExpenseEventType } from "./types";

export interface ExpenseAggregate extends Aggregate {
  create: (params: CreateParams) => void
  update: (params: UpdateParams, metadata?: Metadata) => void
  deleteExpense: (params: DeleteParams, metadata?: Metadata) => void
  restore: (params: RestoreParams, metadata?: Metadata) => void
}

interface CreateParams {
  eventType: ExpenseEventType.Created
  description: string
  amount: number
  date: Date
  createdByUserId: string
  belongsToGroupId: string
}

interface UpdateParams {
  eventType: ExpenseEventType.Updated
  description: string
  amount: number
  updatedByUserId: string
  updatedAt: Date
}

interface DeleteParams {
  eventType: ExpenseEventType.Deleted
  deletedByUserId: string
}

interface RestoreParams {
  eventType: ExpenseEventType.Restored
  restoredByUserId: string
}

interface Expense {
  amount: number
  description: string
  date: Date
  createdByUserId: string
  updatedByUserId?: string
  deletedByUserId?: string
  restoredByUserId?: string
  belongsToGroupId: string
}

enum State {
  Created = `Created`,
  Updated = `Updated`,
  Deleted = `Deleted`,
  Restored = `Restored`,
  None = `None`, 
}

export const expenseAggregate = (aggregateId: string): ExpenseAggregate => {
  // Aggregate private properties
  let state: State = State.None
  let expense: Expense = {
    amount: 0,
    belongsToGroupId: '',
    createdByUserId: '',
    date: new Date(),
    description: '',
  }

  let commitedVersion = 0;
  let uncommitedVersion = 0;
  const unpublishedEnvelopes: EventEnvelope<ExpenseEvent>[] = []

  const apply = (event: ExpenseEvent) => {
    switch(event.eventType){
      case ExpenseEventType.Created:
        {
          state = State.Created
          const { amount, belongsToGroupId, createdByUserId, createdAt: date, description } = event
          expense.amount = amount
          expense.belongsToGroupId = belongsToGroupId
          expense.createdByUserId = createdByUserId
          expense.date = date
          expense.description = description
        }
        break;
      case ExpenseEventType.Updated:
        { 
          state = State.Updated
          const { updatedByUserId, amount, description } = event
          expense.amount = amount
          expense.updatedByUserId = updatedByUserId
          expense.description = description
        }
        break;
      case ExpenseEventType.Deleted:
        {
          state = State.Deleted
          const { deletedByUserId } = event
          expense.deletedByUserId = deletedByUserId
        }
        break;
      case ExpenseEventType.Restored: 
        {
          state = State.Restored
          const { restoredByUserId } = event
          expense.restoredByUserId = restoredByUserId
        }
        break;
    }
    uncommitedVersion++
  }

  const load = (envelopes: PersistedEventEnvelope<ExpenseEvent>[]) => {
    envelopes.forEach(envelope => {
      apply(envelope.payload)
    });
    commitedVersion = uncommitedVersion
  }

  const add = (payload: ExpenseEvent, metadata?: Metadata) => {
    unpublishedEnvelopes.push({
      eventType: payload.eventType,
      metadata: metadata || {},
      payload
    });
    apply(payload)
  }

  const create = (params: CreateParams, metadata?: Metadata) => {
    if(state !== State.None) throw new DomainError(`Expense cannot be created in the current state`)
    const { amount, belongsToGroupId, createdByUserId, date, description, eventType } = params
    add({ eventType, amount, belongsToGroupId, createdByUserId, createdAt: date, description })
  }

  const update = (params: UpdateParams, metadata?: Metadata) => {
    if(state !== State.Created && state !== State.Restored && state !== State.Updated) throw new DomainError(`Expense cannot be in modified in current state`);
    const { amount, description, eventType, updatedByUserId, updatedAt } = params
    add({ eventType, amount, description, updatedByUserId, updatedAt })
  }

  const deleteExpense = (params: DeleteParams, metadata?: Metadata) => {
    if(state !== State.Created && state !== State.Restored && state !== State.Updated) throw new DomainError(`Expense cannot be in modified in current state`);
    const { eventType, deletedByUserId } = params
    add({ eventType, deletedByUserId })
  }

  const restore = (params: RestoreParams, metadata?: Metadata) => {
    if(state !== State.Deleted) throw new DomainError(`Expense cannot be restored from current state`)
    const { eventType, restoredByUserId } = params
    add({ eventType, restoredByUserId });
  }

  return {
    aggregateId,
    create,
    update,
    deleteExpense,
    restore,
    commitedVersion: () => commitedVersion,
    uncommitedVersion: () => uncommitedVersion,
    unpublishedEnvelopes: () => unpublishedEnvelopes,
    load,
  }
}