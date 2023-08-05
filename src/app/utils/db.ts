import { Pool } from "pg"

export const getTestDBPool = () => {
    return new Pool({
        host: process.env.POSTGRES_HOST ?? `localhost`,
        port: Number(process.env.POSTGRES_PORT ?? 5432),
        user: process.env.POSTGRES_USER ?? `postgres`,
        password: process.env.POSTGRES_PASSWORD ??`postgres`,
        database: process.env.POSTGRES_DB ?? `expense_mate`
    })
}

export const getDBPool = () => {
    return new Pool({
        host: process.env.DB_HOST,
        port: 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    })
}