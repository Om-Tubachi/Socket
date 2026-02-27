/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { useChat } from '../Context/chatContext'
import { useRoom } from '../Context/roomContext'

function Chat() {
    const { handleChatInput, messages } = useChat()
    const { room, roomId } = useRoom()
    const [input, setInput] = useState('')

    return (
        <>
            <h2 className='text-xl font-bold text-white mb-4'>Chat</h2>

            {/* Messages container - scrollable */}
            <div className='flex-1 overflow-y-auto mb-4 space-y-2'>
                {messages.map((msg, i) => (
                    <p key={i} className={msg.correct ? 'text-green-400' : 'text-white'}>
                        <span className='font-semibold'>{msg.player.username}:</span> {msg.message}
                    </p>
                ))}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    handleChatInput(input, roomId)
                    setInput('')  
                }}
                className='mt-auto'  
            >
                <div className='flex gap-2'>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type a guess..."
                        className='flex-1 px-4 py-2 rounded bg-slate-700 text-white'
                    />
                    <button
                        type="submit"
                        className='px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded text-white font-semibold'
                    >
                        Send
                    </button>
                </div>
            </form>
        </>
    )
}

export default Chat