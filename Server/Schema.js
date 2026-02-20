

const Room = {
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
    isPrivate: false,
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
}