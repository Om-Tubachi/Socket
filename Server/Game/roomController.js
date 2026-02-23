import client from "../Utils/redis.js";
import { socketHandler } from "../Utils/socketHandler.js";
import { ClientEvent, RoomState } from "../Constants.js";
import { ServerEvent } from "../Constants.js";
import {
    createNewRoom,
    generateRoomId,
    getPublicRoom,
    getRedisRoom,
    setRedisRoom,
    getRoomFromSocket
} from '../Utils/redis.js'


export const handlePlayerJoin = socketHandler(
    async (roomId, player, socket, io) => {

        try {
            const id = player.id
            let room = await getRedisRoom(roomId)
            let players = room.players
            if (players.length === room.settings.players) {
                socket.emit(ServerEvent.RESPONSE, {
                    message: 'Room limit reached.'
                })
                console.log('Max limit of room reached')
                return
            }
            players.push(player)
            room.players = players
            await setRedisRoom(roomId, room, socket)
            const updated = await getRedisRoom(roomId)

            console.log('Emitting event:', ServerEvent.JOINED)
            socket.join(roomId)
            io.to(roomId).emit(ServerEvent.JOINED, {
                room: updated,
                data: {
                    message: 'joined room',
                    player
                }
            })
            return
        } catch (error) {
            socket.emit(ServerEvent.ERROR, {
                message: 'Error in joining game.'
            })
        }

    }
)

export const handleNewPlayer = socketHandler(
    async (roomId, player, socket) => {
        // if (!player)
        //     throw new CustomResponse(409, {}, "Player info is missing")
        const playerId = player.id

        if (roomId === null && playerId) {
            roomId = await getPublicRoom()
            if (roomId === null) {
                roomId = generateRoomId()
                await createNewRoom(roomId, false, null)
                return roomId
            }

            return roomId
        }

        let room = await getRedisRoom(roomId)
        if (!room) {
            // admin is making this room
            await createNewRoom(roomId, true, socket.id)
            return roomId
        }
        return roomId
    }
)

export const handleDisconnect = socketHandler(
    async (socket, io) => {
        // MANY DIFFERENT CASES WILL COME HERE, WHERE THE PNE WHO DISCONNECTED COUD BE HOST,
        // CURRENT PLAYER OR A PARTICIPANT

        let room = await getRoomFromSocket(socket.id)
        if (room === null) {
            socket.emit(ServerEvent.ERROR, {
                message: 'No such room found, invalid room id'
            })
            console.log('Player was not dfound in any rooms');

            return
        }
        const playerLeft = room?.players?.find(({ id }) => id === socket.id)
        room.players = room?.players.filter(({ id }) => id !== socket.id)
        
        // Host left:
        if (playerLeft?.id === room.creator) {           
            if (room.players.length > 0) {
                // Transfer host to first remaining player
                room.creator = room.players[0].id
                console.log(`Host left. New host: ${room.players[0].username}`)
            }
        }

        await setRedisRoom(room.roomId, room)
        
        io.to(room.roomId).emit(ServerEvent.LEFT, {
            message: 'player left',
            playerLeft,
            newHost: playerLeft.id === room.creator ? room.players[0] : null
        })
    }
)

export const handleSettingsChange = socketHandler(
    async (roomId, newSettings, io) => {
        let room = await getRedisRoom(roomId)
        if(!room) {
            socket.emit(ServerEvent.ERROR, {
                message:'Failed to fetch room for diven room id, settings not updated'
            })
            return
        }

        room = {
            ...room,
            settings:newSettings
        }

        await setRedisRoom(roomId, room)

        io.to(roomId).emit(ClientEvent.SETTINGS_UPDATE, {
            room
        })
    }
)