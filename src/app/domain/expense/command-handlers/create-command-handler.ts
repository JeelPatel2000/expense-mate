import { ExpenseRepository } from "../repository"
import { v4 as uuid } from 'uuid'

interface CreateExpenseCommandParams {
  description: string
  amount: number
  createdByUserId: string
  belongsToGroupId: string
}

interface CreateExpenseCommandHandlerResult {
  expenseId: string
}

export interface CreateExpenseCommandHandler {
  (params: CreateExpenseCommandParams): Promise<CreateExpenseCommandHandlerResult>
}

export const createExpenseCommandHandler = (expenseRepository: ExpenseRepository): CreateExpenseCommandHandler => async (params) => {
  const aggregateId = uuid();
  const aggregate = await expenseRepository.load(aggregateId)
  const { amount, belongsToGroupId, createdByUserId, description } = params
  aggregate.create({ amount, belongsToGroupId, createdAt: new Date(), createdByUserId, description })
  await expenseRepository.save(aggregate)
  return { expenseId: aggregateId };
}