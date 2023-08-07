import { Router } from "express"
import z from 'zod'
import { CreateExpenseCommandHandler } from "./command-handlers/create-command-handler";
import { ExpenseQueryHandler } from "./query-handlers/expense-query-handler";

const expenseSchema = z.object({
  amount: z.number(),
  description: z.string().nullable(),
  createdByUserId: z.string(),
  belongsToGroupId: z.string()
}).strict()

export const expenseRouter = (
  createExpenseCommandHandler: CreateExpenseCommandHandler,
  expenseQueryHandler: ExpenseQueryHandler
): Router => {
  const router = Router();

  router.post('/', async (req, res) => {
    const { amount, belongsToGroupId, createdByUserId, description } =  expenseSchema.parse(req.body)
    const result = await createExpenseCommandHandler({ amount, belongsToGroupId, createdByUserId, description: description ?? '' })
    return res.status(201).send(result)
  })

  router.get('/:id', async (req,res) => {
    const id = req.params.id
    const expense = await expenseQueryHandler({ expenseId: id })
    
    if(!expense) return res.status(404).send()

    return res.status(200).send(expense)
  })

  return router
}