import { Aggregate, EventEnvelope, Metadata, PersistedEventEnvelope, StreamType } from "../../event-store/types";
import { ExpenseEvent, ExpenseEventType } from "./types";

export interface ExpenseAggregate extends Aggregate {
  create: (params: CreateParams) => void
}

interface CreateParams {
  eventType: ExpenseEventType.Created
  description: string
  amount: number
  date: Date
  createdByUserId: string
  belongsToGroupId: string
}

export const expenseAggregate = (aggregateId: string): ExpenseAggregate => {
  // Aggregate private properties
  let amount: number = 0
  let description: string
  let date: Date
  let createdByUserId: string
  let belongsToGroupId: string
  //

  let commitedVersion = 0;
  let uncommitedVersion = 0;
  const unpublishedEnvelopes: EventEnvelope<ExpenseEvent>[] = []

  const apply = (event: ExpenseEvent) => {
    switch(event.eventType){
      case ExpenseEventType.Created:
        break;
      case ExpenseEventType.Updated: 
        break;
      case ExpenseEventType.Deleted: 
        break;
      case ExpenseEventType.Restored: 
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
    const {amount, belongsToGroupId, createdByUserId, date, description, eventType} = params
    add({ eventType: eventType, amount, belongsToGroupId, createdByUserId, date, description })
  }

  return {
    aggregateId,
    create,
    commitedVersion: () => commitedVersion,
    uncommitedVersion: () => uncommitedVersion,
    unpublishedEnvelopes: () => unpublishedEnvelopes,
    load: load
  }
}