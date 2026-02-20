import React from 'react';
import { socket } from '../socket'

export function ConnectionManager() {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <>
      <button className='bg-gray-600 px-2 mx-1 rounded-sm py-1 text-white' onClick={ connect }>Connect</button>
      <button className='bg-gray-600 px-2 mx-1 rounded-sm py-1 text-white' onClick={ disconnect }>Disconnect</button>
    </>
  );
}