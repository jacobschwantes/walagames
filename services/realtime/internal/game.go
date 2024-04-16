package realtime

type Game struct {
	State    *GameState
	Settings *GameSettings
	Control  chan string
}

func NewGame(mode string, totalRounds int, roundLength int) *Game {
	return &Game{
		State: &GameState{
			SubmittedAnswers: make(map[string]string),
			CurrentRound:     1,
		},
		Settings: &GameSettings{
			Mode:          mode,
			TotalRounds:   totalRounds,
			RoundDuration: roundLength,
		},
		Control: make(chan string),
	}
}

type GameState struct {
	Question         Question          `json:"question,omitempty"`
	Deadline         int64             `json:"deadline,omitempty"`
	CurrentRound     int               `json:"currentRound,omitempty"`
	SubmittedAnswers map[string]string `json:"-"`
}
type GameSettings struct {
	Mode          string `json:"mode,omitempty"`
	TotalRounds   int    `json:"totalRounds,omitempty"`
	RoundDuration int    `json:"roundLength,omitempty"` // in seconds
}

type GameService interface {
	StartGame(l *Lobby) error
	// PauseGame(l *Lobby) error
	// ResumeGame(l *Lobby) error
	EndGame(l *Lobby) error
}
