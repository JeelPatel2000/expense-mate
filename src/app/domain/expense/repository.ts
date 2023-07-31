import { EventStore } from "../../event-store/event-store"
import { StreamType } from "../../event-store/types"
import { ExpenseAggregate, expenseAggregate } from "./aggregate"
import { ExpenseEvent } from "./types"

export interface ExpenseRepository {
  save: (aggregate: ExpenseAggregate) => Promise<void>
  load: (expenseId: string) => Promise<ExpenseAggregate>
}

export const expenseRepository = (eventStore: EventStore): ExpenseRepository => {
  const save = async (aggregate: ExpenseAggregate) => {
    await eventStore.append(StreamType.Expense, aggregate.aggregateId, aggregate.commitedVersion(), aggregate.unpublishedEnvelopes())
  }

  const load = async (expenseId: string) => {
    const events = await eventStore.readStream<ExpenseEvent>(expenseId, StreamType.Expense);
    const expenseAggegate = expenseAggregate(expenseId)
    expenseAggegate.load(events)
    return expenseAggegate
  }

  return {
    save,
    load
  }
}