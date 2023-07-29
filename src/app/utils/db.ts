import { Pool } from "pg"

export const getTestDBPool = () => {
    return new Pool({
        host: `localhost`,
        port: 5432,
        user: `postgres`,
        password: `postgres`,
        database: `expense-mate`
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