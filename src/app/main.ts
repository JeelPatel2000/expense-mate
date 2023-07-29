import { server } from "./server"

const app = server()

app.listen(3000, () => {
    console.log('Listening on port 3000')
})