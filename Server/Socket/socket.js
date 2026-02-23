import { Server, Socket } from "socket.io"
import { ClientEvent, ServerEvent } from "../Constants.js"
import {
    getRoomFromSocket,
    setRedisRoom
} from "../Utils/redis.js"
import { socketHandler } from "../Utils/socketHandler.js";
import {
    handlePlayerJoin,
    handleNewPlayer,
    handleDisconnect,
    handleSettingsChange
} from '../Game/roomController.js'


export const setupSocket = socketHandler(
    async (io) => {
        io.on('connect', async (socket) => {
            console.log('User connected, ', socket.id)

            socket.on(ClientEvent.DISCONNECT, async () => {
                await handleDisconnect(socket, io)

            })

            socket.on(ClientEvent.JOIN_GAME, async ({ roomId, player }) => {
                console.log(player)
                roomId = await handleNewPlayer(roomId, player, socket)
                await handlePlayerJoin(roomId, player, socket, io)
                // ack(true)
            })

            socket.on(ClientEvent.SETTINGS_UPDATE, async({roomId, newSettings}) => {
                await handleSettingsChange(roomId, newSettings, io);
            })

        })
    }
)
