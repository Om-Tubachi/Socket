import React from 'react';

export function ConnectionState({ isConnected }) {
  return <p className='text-green-500 bg-gray-800 w-fit px-3 py-1'>State: { '' + isConnected }</p>;
}