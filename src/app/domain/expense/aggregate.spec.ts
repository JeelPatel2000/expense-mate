import { PersistedEventEnvelope, StreamType } from "../../event-store/types"
import { expenseAggregate } from "./aggregate";
import { ExpenseCreatedEvent, ExpenseDeletedEvent, ExpenseEvent, ExpenseEventType, ExpenseRestoredEvent, ExpenseUpdatedEvent } from "./types"

describe(`Expense aggregate tests`, () => {

  const now = new Date();
  const amount = 100;
  const updatedAmount = 200;
  const description = `grocery expense`;
  const createdByUserId = `user-001`
  const belongsToGroupId = `group-001`
  const updatedByUserId = `user-002`
  const updatedAt = now
  const deletedByUserId = `user-003`
  const restoredByUserId = `user-004`

  const expenseCreatedEvent: ExpenseCreatedEvent = {
    eventType: ExpenseEventType.Created,
    amount,
    description,
    createdByUserId,
    belongsToGroupId,
    createdAt: now
  }
  const expenseUpdatedEvent: ExpenseUpdatedEvent = {
    eventType: ExpenseEventType.Updated,
    amount: updatedAmount,
    description,
    updatedByUserId,
    updatedAt
  }
  const expenseDeletedEvent: ExpenseDeletedEvent = {
    eventType: ExpenseEventType.Deleted,
    deletedByUserId
  }
  const expenseRestoredEvent: ExpenseRestoredEvent = {
    eventType: ExpenseEventType.Restored,
    restoredByUserId
  }
  const givenEventEnvelope = (streamId: string, position: number, eventType: ExpenseEventType, version: number, event: ExpenseEvent): PersistedEventEnvelope<ExpenseEvent> => {
    return {
      streamType: StreamType.Expense,
      streamId,
      position: position.toString(),
      timestamp: now,
      version,
      eventType,
      payload: event,
      metadata: {}
    }
  }

  test(`given event envelopes > when load aggregate > it build aggregate state`, () => {
    const aggregate = expenseAggregate(`expense-001`);
    const persistedEventEnvelopes: PersistedEventEnvelope<ExpenseEvent>[] = [
      givenEventEnvelope(`expense-001`, 1, ExpenseEventType.Created, 1, expenseCreatedEvent),
      givenEventEnvelope(`expense-001`, 2, ExpenseEventType.Updated, 2, expenseUpdatedEvent),
      givenEventEnvelope(`expense-001`, 3, ExpenseEventType.Created, 3, expenseDeletedEvent),
      givenEventEnvelope(`expense-001`, 4, ExpenseEventType.Created, 4, expenseRestoredEvent),
    ]
    aggregate.load(persistedEventEnvelopes);
    expect(aggregate.commitedVersion()).toBe(4);
  })

  test(`given an expense > when expense update > raises expense updated event`, () => {
    const aggregate = expenseAggregate(`expense-001`)
    const persistedEventEnvelopes: PersistedEventEnvelope<ExpenseEvent>[] = [
      givenEventEnvelope(`expense-001`, 1, ExpenseEventType.Created, 1, expenseCreatedEvent),
      givenEventEnvelope(`expense-001`, 2, ExpenseEventType.Created, 2, expenseDeletedEvent),
      givenEventEnvelope(`expense-001`, 3, ExpenseEventType.Created, 3, expenseRestoredEvent),
    ]
    aggregate.load(persistedEventEnvelopes)
    aggregate.update(expenseUpdatedEvent)
    expect(aggregate.unpublishedEnvelopes().length).toBe(1);
    expect(aggregate.unpublishedEnvelopes()).toEqual([
      { eventType: ExpenseEventType.Updated, metadata: {}, payload: { amount: 200, description: `grocery expense`, eventType: `Updated`, updatedAt: now, updatedByUserId: `user-002` }}
    ]);
  })
})
