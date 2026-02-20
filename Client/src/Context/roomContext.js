/* eslint-disable no-unused-vars */
import React from "react";
import { useContext } from "react";
import { createContext } from "react";

const roomContext = createContext({
    room: {
        roomId: "",
        creator: "",
        players: [],
        gameState: {
            currentRound: 0,
            drawingData: [],
            guessedWords: [],
            word: "",
            currentPlayer: 0,
            roomState: '',
            timerStartedAt: new Date(),
            hintLetters: [],
        },
        settings: {
            players: 0,
            drawTime: 0,
            rounds: 0,
            onlyCustomWords: false,
            customWords: [],
            wordCount: 0,
            hints: 0,
            // language: Languages.en,
        },
        isPrivate: false,

    }
    // functions

})

export const useRoom = () => {
    return useContext(roomContext)
}

export const RoomProvider = roomContext.Provider