import React from 'react';

export function ConnectionState({ isConnected }) {
  return <p className='text-green-500 bg-gray-800 w-fit px-3 py-2'>State: { '' + isConnected }</p>;
}