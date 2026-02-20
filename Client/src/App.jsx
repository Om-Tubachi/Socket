/* eslint-disable no-unused-vars */
import React from 'react';
import { useState, useEffect } from 'react'
import { socket } from './socket';
import { ConnectionState } from './Components/ConnectionState';
import { ConnectionManager } from './Components/ConnectionManager';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);


  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }


    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-400 p-6">
        {/* Left sidebar */}
        <div className="fixed top-6 left-6 flex flex-col gap-4">
          <ConnectionState isConnected={isConnected} />
          <ConnectionManager />
        </div>

        {/* Center content - future components go here */}
        <div className="flex justify-center">

        </div>
      </div>
    </>
  )
}

export default App
