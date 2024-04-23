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