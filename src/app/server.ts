import express from 'express';
import { expenseRouter } from './domain/expense/router';
import { createExpenseCommandHandler } from './domain/expense/command-handlers/create-command-handler';
import { expenseRepository } from './domain/expense/repository';
import { inMemoryEventStore } from './event-store/event-store';
import { expenseQueryHandler } from './domain/expense/query-handlers/expense-query-handler';

export const server = () => {
    console.log('Hello')
    const app = express()
    // initialize dependencies
    const eventStore = inMemoryEventStore()
    const expenseRepo = expenseRepository(eventStore);

    app.use(express.json())
    app.use('/expense', expenseRouter(createExpenseCommandHandler(expenseRepo), expenseQueryHandler(eventStore)))
    app.get('/', (req, res) => {
        res.send('Hello world');
    })
    return app;
}