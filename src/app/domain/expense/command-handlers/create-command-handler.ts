import { EventStore } from "../../../event-store/event-store"
import { ExpenseRepository } from "../repository"
import { ExpenseEventType } from "../types"

interface CreateExpenseCommandParams {
    eventType: ExpenseEventType.Created
    description: string
    amount: number
    date: Date
    createdByUserId: string
    belongsToGroupId: string
}

export interface CreateExpenseCommandHandler {
  (params: CreateExpenseCommandParams): void
}

export const createExpenseCommandHandler = (expenseRepository: ExpenseRepository): CreateExpenseCommandHandler => (params) => {
  
}