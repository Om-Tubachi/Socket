/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from 'react'
import { socket } from '../socket.js'
import { ServerEvent, ClientEvent, DEFAULT_ROOM } from '../Constants/Constants.js'

const RoomContext = createContext()

export const RoomProvider = ({ children }) => {
    const [room, setRoom] = useState(DEFAULT_ROOM)
    const [roomId, setRoomId] = useState('')
    const [words, setWords] = useState([])
    const [currPlayer, setCurrPlayer] = useState({})
    useEffect(() => {
        console.log(room)
        console.log(currPlayer?.username);
        socket.on(ServerEvent.JOINED, ({ room: receivedRoom, data }) => {
            if (!receivedRoom) return
            setRoomId(receivedRoom.roomId)
            setRoom(receivedRoom)
        })

        socket.on(ServerEvent.ERROR, ({ message }) => {
            alert(message)
        })
        socket.on(ServerEvent.RESPONSE, ({ message }) => {
            alert(message)
        })

        socket.on(ServerEvent.LEFT, ({ playerLeft, newHost }) => {
            setRoom(prev => {
                const updatedRoom = {
                    ...prev,
                    players: prev.players.filter(p => p.id !== playerLeft.id)
                }
                if (newHost) {
                    updatedRoom.creator = newHost.id
                    if (newHost.id === socket.id) {
                        alert(`${playerLeft.username} left. You are now the host!`)
                    } else {
                        alert(`${playerLeft.username} left. ${newHost.username} is now the host.`)
                    }
                } else {
                    alert(`${playerLeft.username} left the room`)
                }

                return updatedRoom
            })
        })

        socket.on(ClientEvent.SETTINGS_UPDATE, ({ room: receivedRoom }) => {
            if (!receivedRoom?.settings) alert('Empty settings, not changing the settings ')
            else setRoom(receivedRoom)
        })

        socket.on(ServerEvent.CHOSE_WORD, ({ currPlayer,words, message, room: receivedRoom }) => {
            setRoom(receivedRoom)
            setCurrPlayer(currPlayer)
            setWords(words)
        })

        socket.on(ServerEvent.CHOSING_WORD, ({ currPlayer, message, room: receivedRoom }) => {
            console.log(currPlayer);
            setRoom(receivedRoom)
            setCurrPlayer(currPlayer)

        })

        socket.on(ServerEvent.GAME_STARTED, ({ room: receivedRoom }) => {
            console.log(receivedRoom);
            setRoom(receivedRoom)

        })

        return () => {
            socket.off(ServerEvent.JOINED)
            socket.off(ServerEvent.ERROR)
            socket.off(ServerEvent.LEFT)
            socket.off(ClientEvent.SETTINGS_UPDATE)
            socket.off(ServerEvent.CHOSE_WORD)
            socket.off(ServerEvent.CHOSING_WORD)
            socket.off(ServerEvent.GAME_STARTED)
        }
    }, [])

    const handlePlayerJoin = (roomId, player) => {
        socket.emit(ClientEvent.JOIN_GAME, { roomId, player })
    }

    const handleSettingsChange = (roomId, newSettings) => {
        // plan toasts tomorrow instead of returns
        if (!newSettings)
            console.log('Invalid object recieved for settings, returned');
        socket.emit(ClientEvent.SETTINGS_UPDATE, {
            roomId,
            newSettings
        })

    }

    const generateRoomId = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
    }

    const customRoom = async (player) => {
        // console.log(player)
        const roomId = generateRoomId()
        return handlePlayerJoin(roomId, player)
    }

    const setWord = async (chosenWord) => {
        if (!chosenWord) {
            alert('Did not recieve chosen word')
            return
        }
        if (chosenWord === "" && words.length > 0) chosenWord = words[0]
        socket.emit(ServerEvent.CHOSE_WORD, {
            chosenWord,
            roomId
        })
    }

    const start = () => {
        console.log('Start clicked, sending event');

        socket.emit(ClientEvent.START_GAME, { roomId })
    }
    return (
        <RoomContext.Provider value={{
            room,
            roomId,
            words,
            currPlayer,
            handlePlayerJoin,
            customRoom,
            handleSettingsChange,
            setWord,
            start
        }}>
            {children}
        </RoomContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRoom = () => {
    const context = useContext(RoomContext)
    if (!context) throw new Error('useRoom must be used within RoomProvider')
    return context
}