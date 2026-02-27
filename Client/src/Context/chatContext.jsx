/* eslint-disable no-empty */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from 'react'
import { socket } from '../socket.js'
import { ServerEvent, ClientEvent, DEFAULT_ROOM } from '../Constants/Constants.js'


const ChatContext = createContext()

export const ChatProvider = ({ children }) => {

    const [messages, setMessages] = useState([])

    const appendMessage = (correct, message, player) => {
        // append this message on-to chat section
        if(!player) {
            alert('Player obj did not recieve from server')
            return
        }
        if(correct) {
            message = `${player?.username} guessed the word!`
        }
        setMessages(prev => [...prev, {player,message,correct,timestamp: Date.now()}])
    }

    useEffect(() => {
        socket.on(ServerEvent.INCORRECT_GUESS, ({
            from,
            response,
            message
        }) => {
            appendMessage(false, message, from)
        })
        socket.on(ServerEvent.CORRECT_GUESS, ({
            from,
            response,
            message
        }) => {
            appendMessage(true, message, from)
        })
        return (() => {
            socket.off(ServerEvent.INCORRECT_GUESS)
            socket.off(ServerEvent.CORRECT_GUESS)
        })


    }, [])


    const handleChatInput = (message, roomId) => {
        if (message && message.length === 0) return
        console.log(message);
        
        socket.emit(ClientEvent.SEND_MESSAGE, {
            data: {message},
            roomId
        })
    }


    return (
        <ChatContext.Provider 
        value={{
            messages,
            handleChatInput
        }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = () => {
    const context = useContext(ChatContext)
    return context
}