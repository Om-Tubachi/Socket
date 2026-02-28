/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { socket } from '../../socket'
import { useRoom } from '../../Context/roomContext'

function SettingsForm() {
    const { room, roomId, handleSettingsChange } = useRoom()
    const isHost = socket.id === room.creator

    const handleChange = (key, value) => {
        if (!isHost) return

        const newSettings = { ...room.settings, [key]: value }
        handleSettingsChange(roomId, newSettings)
    }
    return (
        <div className='bg-slate-800 rounded-lg p-6'>
            <h2 className='text-xl font-bold text-white mb-4'>Game Settings</h2>

            <div className='space-y-4'>
                <div>
                    <label className='block text-sm text-slate-300 mb-1'>Max Players</label>
                    <select
                        value={room.settings.players}
                        onChange={(e) => handleChange('players', parseInt(e.target.value))}
                        disabled={!isHost}
                        className='w-full bg-slate-700 text-white px-3 py-2 rounded disabled:opacity-50'
                    >
                        <option value={5}>5</option>
                        <option value={8}>8</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                    </select>
                </div>

                <div>
                    <label className='block text-sm text-slate-300 mb-1'>Draw Time</label>
                    <select
                        value={room.settings.drawTime}
                        onChange={(e) => handleChange('drawTime', parseInt(e.target.value))}
                        disabled={!isHost}
                        className='w-full bg-slate-700 text-white px-3 py-2 rounded disabled:opacity-50'
                    >
                        <option value={15}>15s</option>

                        <option value={30}>30s</option>
                        <option value={60}>60s</option>
                        <option value={90}>90s</option>
                    </select>
                </div>

                <div>
                    <label className='block text-sm text-slate-300 mb-1'>Rounds</label>
                    <input
                        type="number"
                        min="1"
                        max="10"
                        value={room.settings.rounds}
                        onChange={(e) => handleChange('rounds', parseInt(e.target.value))}
                        disabled={!isHost}
                        className='w-full bg-slate-700 text-white px-3 py-2 rounded disabled:opacity-50'
                    />
                </div>

                <div>
                    <label className='block text-sm text-slate-300 mb-1'>Words to choose</label>
                    <select
                        value={room.settings.wordCount}
                        onChange={(e) => handleChange('wordCount', parseInt(e.target.value))}
                        disabled={!isHost}
                        className='w-full bg-slate-700 text-white px-3 py-2 rounded disabled:opacity-50'
                    >
                        <option value={3}>3</option>
                        <option value={5}>5</option>
                        <option value={7}>7</option>
                    </select>
                </div>

                <div className='flex items-center gap-2'>
                    <input
                        type="checkbox"
                        checked={room.settings.onlyCustomWords}
                        onChange={(e) => handleChange('onlyCustomWords', e.target.checked)}
                        disabled={!isHost}
                        className='w-4 h-4'
                    />
                    <label className='text-sm text-slate-300'>Use only custom words</label>
                </div>
                {/* Custom Words Input */}
                {room.settings.onlyCustomWords && (
                    <div>
                        <label className='block text-sm text-slate-300 mb-1'>Custom Words (comma separated)</label>
                        <textarea
                            value={room.settings.customWords.join(', ')}
                            onChange={(e) => {
                                const words = e.target.value.split(',').map(w => w.trim()).filter(Boolean)
                                handleChange('customWords', words)
                            }}
                            disabled={!isHost}
                            placeholder="apple, dog, house, car..."
                            className='w-full bg-slate-700 text-white px-3 py-2 rounded disabled:opacity-50 min-h-20'
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default SettingsForm