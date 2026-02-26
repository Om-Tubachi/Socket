import React from 'react'
import { useRoom } from '../Context/roomContext'
import { socket } from '../socket.js'


function ChoseChosing() {
    const { currPlayer, words, setWord } = useRoom()
    console.log('curr is:');
    console.log({currPlayer});
    console.log(`socket id is ${socket.id}`);
    
    return (
        <>
            {socket?.id === currPlayer?.id ? (
                <div className='w-1/2 h-1/2 bg-gray-400 flex justify-center align-middle'>
                    <form onSubmit={(e) => setWord(e?.target?.value)}>
                        {words.map((word, index) => (
                            <div key={index} className='border-2 border-white px-3 py-2 mx-2 my-1'>
                                <button type="submit" value={word} />
                            </div>
                        ))}

                    </form>
                </div>
            ) : socket.id !== currPlayer?.id && (
                
                <div className='w-1/2 h-1/2 bg-gray-400 flex justify-center align-middle'>
                    <p>{currPlayer?.username + ' is chosing a word'}</p>
                </div>
            )}
        </>
    )
}

export default ChoseChosing