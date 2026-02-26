import client from "../Utils/redis.js";
import { socketHandler } from "../Utils/socketHandler.js";
import { ClientEvent, RoomState, ServerEvent, END_REASON, MAX_POINTS } from "../Constants.js";
import {
    createNewRoom,
    generateRoomId,
    getPublicRoom,
    getRedisRoom,
    setRedisRoom,
    getRoomFromSocket
} from '../Utils/redis.js'
import { getWords } from "../Words/word.js";


const timers = new Map()

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
        if (!room) {
            socket.emit(ServerEvent.ERROR, {
                message: 'Failed to fetch room for diven room id, settings not updated'
            })
            return
        }

        room = {
            ...room,
            settings: newSettings
        }

        await setRedisRoom(roomId, room)

        io.to(roomId).emit(ClientEvent.SETTINGS_UPDATE, {
            room
        })
    }
)

export const startGame = socketHandler(
    async (roomId, socket, io) => {
        console.log(roomId + " in fn");

        // client requests start game w roomId
        // validate game 
        // validate who req to start
        // change roomstate to in progress
        // call next turn -> will set up and initiate game

        const isValid = await validateGame(roomId)
        if (!isValid) {
            socket.emit(ServerEvent.RESPONSE, {
                message: 'Failed to start game, either number of players is less or...'
            })
            return
        }

        let room = await getRedisRoom(roomId)
        if (!room) {
            socket.emit(ServerEvent.ERROR, {
                message: 'Room not found'
            })
            return
        }
        if (room?.creator !== socket.id) {
            socket.emit(ServerEvent.RESPONSE, {
                message: 'You are not the host hence not authorised to start the game'
            })
            return
        }

        room.gameState.roomState = RoomState.IN_PROGRESS
        await setRedisRoom(roomId, room)

        io.to(roomId).emit(ServerEvent.GAME_STARTED, {room})
        console.log('in start');
        console.log(room);
        
        console.log(roomId);
        await nextTurn(roomId, socket, io)
    }
)

export const nextTurn = async (roomId, socket, io) => {
    await clearTimers(roomId)
    const t = new Date()
    console.log('timer has been set at in next Turn' + t.toLocaleTimeString());
    const room = await getRedisRoom(roomId)
    const words = await getWords(room?.settings)
    const currId = room?.players[room?.gameState?.currentPlayer]?.id
    const currPlayer = room?.players?.find(({ id }) => id === currId)

    if (!currPlayer) {
        console.log('failed to assign a turn');
        return
    }

    io.to(currId).emit(
        ServerEvent.CHOSE_WORD,
        {
            words,
            message: 'Chose word',
            room,
            currPlayer
        }
    )

    io.to(roomId).except(currId).emit(
        ServerEvent.CHOSING_WORD,
        {
            currPlayer,
            message: `${currPlayer} is chosing a word`,
            room,
        }
    )
    room.gameState.currentPlayer += 1

    // Check if round/game is over
    if (room.gameState.currentPlayer >= room.players.length) {
        room.gameState.currentPlayer = 0
        room.gameState.currentRound += 1
    }

    if (room.gameState.currentRound === room.settings.rounds) {
        io.to(roomId).emit(ServerEvent.GAME_END, { message: 'Game ended' })
        console.log('Ended');

        return
    }

    console.log('curr is');
    console.log(currPlayer);

    // to current player: emit words, to others emit: curr is chosing a word


    await setRedisRoom(roomId, room)
    return await setTimers(roomId, socket, io)
}

// needs thinking
export const handleDraw = socketHandler(
    async (drgData, roomId, socket, io) => {
        if (!drgData) {
            io.to(roomId).emit(ServerEvent.ERROR,
                {
                    message: 'Did not recieving drawing data'
                }
            )
            return
        }

        const room = await getRedisRoom(roomId)
        if (!room) {
            console.log('Failed to fetch room in handleDraw');
            return
        }
        const currPlayerId = room?.players[room?.gameState?.currentPlayer]?.id
        room.gameState.drawingData = drgData.data

        await setRedisRoom(roomId, room)

        io.to(roomId).except(currPlayerId).emit(ServerEvent.DRAW,
            {
                drgData: drgData.data
            }
        )

    }
)

export const handleTexts = socketHandler(
    async (roomId, socket, io, data) => {
        // client will send messages
        // two dec points: if message is not same as current word ->
        // simply emit back that message as it is in the room using io
        // else it will be: same as current word -> handleGuess
        // in handleGuess: update socket.id's points ion players arr by: calling awardPoints
        // save to redis, emit to room "player.username guessed cirrect"
        // then again emit the updated players arr so that it is constantly changing on frontend

        const { message } = data
        if (!message) {
            socket.emit(ServerEvent.ERROR, {
                message: `Failed to recieve message on server`
            })
            return
        }
        const guess = message.trim()
        const room = await getRedisRoom(roomId)
        if (!room) {
            socket.emit(ServerEvent.ERROR, {
                message: `Failed to get room from redis, (in handleTexts)`
            })
            return
        }

        const currWord = room?.gameState?.word
        const player = room?.players?.find(({ id }) => id === socket?.id)

        if (guess.toLowerCase() === currWord.toLowerCase()) {
            return await handleGuess(roomId, socket, io, player)
        }
        io.to(roomId).emit(ServerEvent.INCORRECT_GUESS, {
            from: player,
            response: `${player} guessed INCORRECT`,
            message // the actual text
        })

    }
)

export const handleGuess = socketHandler(
    async (roomId, socket, io, player) => {
        // we know the guess is correct, simply award points, update room, emit changes
        await awardPoints(roomId, player)
        const room = await getRedisRoom(roomId)
        if (!room) {
            socket.emit(ServerEvent.ERROR, {
                message: `Failed to get room from redis, (in handleGuess)`
            })
            return
        }
        const players = room?.players, upDatedPlayer = room?.players?.find(({ id }) => id === player?.id)

        io.to(roomId).emit(ServerEvent.CORRECT_GUESS, {
            upDatedPlayer,
            response: `${player} guessed CORRECT`,
            message: `${player} guessed the word`,
            updatedPlayersArr: players
        })

    }
)

// needs thinking
export const awardPoints = socketHandler(
    async (roomId, player) => {
        const room = await getRedisRoom(roomId)
        if (!room) {
            socket.emit(ServerEvent.ERROR, {
                message: `Failed to get room from redis, (in awardPoints)`
            })
            return
        }

        // two cases: 1: the player is currentPlayer
        // 2: player is not current and has guessed right

        const currPlayer = room.players[room?.gameState?.currentPlayer]
        if (player.id === currPlayer.id) {

        }

        // points for normal player who guessed right:
        const guessed = room.gameState.guessedWords

    }
)

export const setWord = async (chosenWord, roomId, socket) => {
    const room = await getRedisRoom(roomId)

    if (!room) {
        socket.emit(ServerEvent.ERROR, {
            message: `Failed to fetch room for diven room id, ${chosenWord} not set for room id ${roomId}`
        })
        console.log(`Failed to fetch room for diven room id, ${chosenWord} not set for room id ${roomId}`);
        return
    }

    room.gameState.word = chosenWord
    return await setRedisRoom(roomId, room)

}


const setTimers = async (roomId, socket, io) => {
    if (timers.has(roomId)) {
        clearTimers(roomId)
        return
    }
    const room = await getRedisRoom(roomId)
    if (!room) {
        console.log('Failed to fetch room in setting timer');
        return
    }
    const time = room.settings?.drawTime
    const timeoutId = setTimeout(() => nextTurn(roomId, socket, io), time * 1000);
    timers.set(roomId, timeoutId)
    const t = new Date()
    console.log('timer has been set at' + t.toLocaleTimeString());


}

const clearTimers = async (roomId) => {
    if (!timers.has(roomId)) return
    const id = timers.get(roomId)
    clearTimeout(id)
    timers.delete(roomId)
}

const validateGame = socketHandler(
    async (roomId) => {
        if (!roomId) {
            socket.emit(ServerEvent.ERROR, {
                message: `Failed to recieve room Id while validating`
            })
            return
        }
        const room = await getRedisRoom(roomId)
        if (!room) {
            socket.emit(ServerEvent.ERROR, {
                message: `Failed to get room from redis`
            })
            return
        }

        return room.players && room.players?.length > 1
    }
)
