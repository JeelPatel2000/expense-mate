import { EventStore } from "../../../event-store/event-store"
import { StreamType } from "../../../event-store/types"
import { ExpenseEvent, ExpenseEventType } from "../types"

interface ExpenseQueryParams {
  expenseId: string
}

export interface ExpenseQueryHandler {
  (params: ExpenseQueryParams): Promise<ExpenseItem | undefined>
}

interface ExpenseItem {
  state: `Created` | `Updated` | `Deleted` | `Restored`
  amount: number
  description: string
  createdAt: Date
  belongsToGroupId: string
  createdByUserId: string
  updatedByUserId?: string
  deletedByUserId?: string
  restoredByUserId?: string
}
/**
 * Note: Currently I'm using eventStore to create a query handler, but in future it can be replace by a readmodel or a projection
 * This is where the idea of seperating reads from writes come from. CQRS - Command Query Responsibility Segeration. 
 * It helps to scale your application individually (You could have multiple read replicas serving your reads, and a single writer instance which 
 * handles all the writes and setup a continuous replication/projection from write db to read replicas.)
 */
export const expenseQueryHandler = (eventStore: EventStore): ExpenseQueryHandler => async (params) => {
  const { expenseId } = params
  const expense: ExpenseItem = {
    state: 'Created',
    amount: 0,
    description: '',
    createdAt: new Date(),
    createdByUserId: '',
    updatedByUserId: '',
    deletedByUserId: '',
    restoredByUserId: '',
    belongsToGroupId: '',
  }

  const envelopes = await eventStore.readStream<ExpenseEvent>(expenseId, StreamType.Expense)
  
  if(envelopes.length === 0) return

  envelopes.forEach(envelope => {
    switch(envelope.payload.eventType) {
      case ExpenseEventType.Created:
        {
          const { amount, belongsToGroupId, createdAt, createdByUserId, description } = envelope.payload
          expense.state = 'Created'
          expense.amount = amount
          expense.belongsToGroupId = belongsToGroupId
          expense.createdAt = createdAt
          expense.createdByUserId = createdByUserId
          expense.description = description
          break
        }
      case ExpenseEventType.Updated:
        {
          const { amount, description, updatedByUserId } = envelope.payload
          expense.state = `Updated`
          expense.amount = amount
          expense.description = description
          expense.updatedByUserId = updatedByUserId
          break
        }
      case ExpenseEventType.Deleted:
        {
          const { deletedByUserId } = envelope.payload
          expense.state = 'Deleted'
          expense.deletedByUserId = deletedByUserId
          break
        }
      case ExpenseEventType.Restored:
        {
          const { restoredByUserId } = envelope.payload
          expense.state = 'Restored'
          expense.restoredByUserId = restoredByUserId
          break
        }
    }
  });
  
  return expense
}