import { Server, Socket } from "socket.io"
import { GameEvent } from "../Constants"
import client from "../Utils/redis"
import { asyncHandler } from "../Utils/asyncHandler"
import {
    handlePlayerJoin
} from '../Game/roomController.js'
export const setupSocket = asyncHandler(
    async (io) => {
        io.on('connect', async (socket) => {
            // console.log('User connected, ' , socket.id)
            socket.on(GameEvent.JOIN_GAME, async ({ roomId, player }, ack) => {
                await handlePlayerJoin(roomId, player)
                

            })
        })
    }
)
