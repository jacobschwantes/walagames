package realtime

type Game struct {
	Mode         string
	State        *GameState
	Settings     *GameSettings
	CurrentRound int
	TotalRounds  int
	Control      chan string
}

func NewGame(mode string, totalRounds int, roundLength int) *Game {
	return &Game{
		Mode: mode,
		State: &GameState{
			SubmittedAnswers: make(map[string]string),
			CurrentRound:     1,
		},
		CurrentRound: 1,
		TotalRounds:  totalRounds,
		Settings: &GameSettings{
			Mode:        mode,
			TotalRounds: totalRounds,
			RoundLength: roundLength,
		},
		Control: make(chan string),
	}
}

type GameState struct {
	Question         string            `json:"question,omitempty"`
	Expiration       int64             `json:"expiration,omitempty"`
	CurrentRound     int               `json:"currentRound,omitempty"`
	Answers          []string          `json:"answers,omitempty"`
	SubmittedAnswers map[string]string `json:"-"`
}
type GameSettings struct {
	Mode        string `json:"mode,omitempty"`
	TotalRounds int    `json:"totalRounds,omitempty"`
	RoundLength int    `json:"roundLength,omitempty"`
}

type GameService interface {
	StartGame(l *Lobby) error
	// PauseGame(l *Lobby) error
	// ResumeGame(l *Lobby) error
	EndGame(l *Lobby) error
}
