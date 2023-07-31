import { Aggregate, EventEnvelope, PersistedEventEnvelope } from "../../event-store/types";
import { ExpenseEvent } from "./types";

interface CreateParams {

}

export interface ExpenseAggregate extends Aggregate {
  create: (params: CreateParams) => void
}

export const expenseAggregate = (aggregateId: string): ExpenseAggregate => {
  let commitedVersion = 0;
  let uncommitedVersion = 0;

  const unpublishedEnvelopes: Array<EventEnvelope<ExpenseEvent>> = []

  const apply = (event: ExpenseEvent) => {
    
  }

  const load = (envelopes: PersistedEventEnvelope<ExpenseEvent>[]) => {

  }

  return {
    aggregateId,
    create: (params) => {},
    commitedVersion: () => commitedVersion,
    uncommitedVersion: () => uncommitedVersion,
    unpublishedEnvelopes: () => unpublishedEnvelopes,
    load: load
  }
}