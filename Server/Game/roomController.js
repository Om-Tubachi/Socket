import client from "../Utils/redis";
import { asyncHandler } from "../Utils/asyncHandler";
import { CustomResponse } from "../Response/CustomResponse";
import { CustomError } from '../Response/CustomError'
import { RoomState } from "../Constants";


export const handlePlayerJoin = asyncHandler(
    async (roomId, player) => {
        try {
            if (roomId === '') {
                // random room join case

                let id = await getEmptyRoom()
                if (!id) {
                    id = await createEmptyRoom()
                }
                if (!id) throw new CustomError(409, "Failed to join a random room")
                roomId = id
            }

            const room = await client.get(roomId)
            if (!room) throw new Error('Failed to fetch room from cache or room id is invalid')
            // players full?
            // room state: if ended -> return 'Game ended, join another room'

            const players = room.players, maxPlayers = room?.settings?.players, roomState = room?.gameState?.roomState

            if (players && players.length === maxPlayers) {
                throw new CustomResponse(500, {}, "Room is full")
            }
            if (roomState === RoomState.GAME_END) {
                throw new CustomResponse(500, {}, "Game has ended")
            }

            players.push(player.id)
            room.players = players
            await client.set(roomId, room)

            return
        } catch (error) {
            throw new CustomError(404, "Something went wrong", error)
        }


    }
) 