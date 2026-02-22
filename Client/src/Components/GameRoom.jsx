/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { useRoom } from '../Context/roomContext'
import { socket } from '../socket'
function GameRoom() {
  const { room, roomId, handlePlayerJoin, customRoom, creator } = useRoom()
  // console.log(room.players)
  return (
    <div className='w-full h-screen flex gap-4 p-4'>
      {/* Players sidebar - left */}
      <div id="players" className='w-1/4 bg-slate-800 rounded-lg p-4 overflow-y-auto'>
        <h2 className='text-xl font-bold text-white mb-4'>Players ({room.players.length})</h2>
        {room.players.length > 0 ? (
          room.players.map((player) => (
            <div key={player.id} className='bg-slate-700 px-4 py-3 rounded-lg mb-2 flex justify-between items-center'>
              <span className='font-semibold text-white'>{player.username}</span>
              {player.id === room.creator && (
                <span className='text-xs text-violet-400'>Host</span>
              )}
            </div>
          ))
        ) : (
          <span className='text-slate-400 text-sm'>No players</span>
        )}
      </div>

      {/* Drawing board - center */}
      <div id="drawing-board" className='flex-1 bg-white rounded-lg'>
        {/* Canvas goes here */}
      </div>

      {/* Chat - right */}
      <div id="chat" className='w-1/4 bg-slate-800 rounded-lg p-4 flex flex-col'>
        <h2 className='text-xl font-bold text-white mb-4'>Chat</h2>
        <div className='flex-1 overflow-y-auto'>
          {/* Messages go here */}
        </div>
        <input
          type="text"
          placeholder="Type a guess..."
          className='mt-4 px-4 py-2 rounded bg-slate-700 text-white'
        />
      </div>
    </div>

  )
}

export default GameRoom