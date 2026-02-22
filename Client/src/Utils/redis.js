import socket from '../socket'
import { ClientEvent } from '../Constants/Constants'


export const getRedisRoom = (roomId) => {
    socket.emit(ClientEvent.GET_ROOM, {roomId})
    socket.on(ClientEvent.GET_ROOM, (room) => {
        return room
    })
    return null
}