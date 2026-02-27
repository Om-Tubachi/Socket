import express from 'express'
import client from './Utils/redis.js'
import { Server } from 'socket.io';
import { setupSocket } from './Socket/socket.js';
import cors from 'cors'
import { createServer } from 'node:http';
// client.on('error', (err) => console.log('Redis error:', err))

await client.connect()
await client.flushAll()
console.log('Cleared');

const app = express()
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
}))
const PORT = 3000
const server = createServer(app,);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});


setupSocket(io)

app.get('/', (req, res) => {
    res.send('Hello')
})

server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
