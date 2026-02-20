import client from "../Utils/redis";
import { asyncHandler } from "../Utils/asyncHandler";
import { CustomResponse } from "../Response/CustomResponse";
import { CustomError } from '../Response/CustomError'
import { RoomState, DEFAULT_ROOM } from "../Constants";


export const generateEmptyRoom = asyncHandler(
    async (isPrivate, socket) => {
        const roomId = await generateRoomId()

        const newRoom = DEFAULT_ROOM
        newRoom.roomId = socket.id
        newRoom.creator = isPrivate ? socket.id : null
        newRoom.isPrivate = true
        
    }
)

export const generateRoomId = asyncHandler(
    async () => {
        const id = 'Hello'
        return id
    }
)