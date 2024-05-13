package realtime

type GameState struct {
	Question         Question          `json:"question,omitempty"`
	AnswerDeadline   int64             `json:"answerDeadline,omitempty"`
	CurrentRound     int               `json:"currentRound,omitempty"`
	SubmittedAnswers map[string]string `json:"-"`
}
type GameSettings struct {
	QuizID      string `json:"quizID"`
	TotalRounds int    `json:"totalRounds,omitempty"`
	TimeLimit   int    `json:"timeLimit,omitempty"` // in seconds
}

// Player emitted events
const (
	SUBMIT_ANSWER LobbyEventType = "SUBMIT_ANSWER"
)

// Server emitted events
const (
	UPDATE_SCORES LobbyEventType = "UPDATE_SCORES"
	NEW_ROUND     LobbyEventType = "NEW_ROUND"
	GAME_START    LobbyEventType = "GAME_START"
	GAME_OVER     LobbyEventType = "GAME_OVER"
)
