import express from 'express';

export const server = () => {
    const app = express()

    app.get('/', (req, res) => {
        res.send('Hello world');
    })

    return app;
}