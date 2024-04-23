package realtime

type Lobby interface {
	Player(userID string) (*Player, error)
	Players() []*Player
	Code() string
	Connect(userID string, c Client) error
	Disconnect(id string)
	RegisterPlayer(p *Player) error
	Run()
	SetGame(g Game)
	PushEvent(userID string, e Event)
	Broadcast(msg []byte) 
}

type LobbyState struct {
	Code     string        `json:"code,omitempty"`
	Players  []Player      `json:"players,omitempty"`
	State    *GameState    `json:"state,omitempty"`
	Settings *GameSettings `json:"settings,omitempty"`
}

type LobbyController interface {
	Lobby(code string) (Lobby, error)
	CreateLobby() (Lobby, error)
	CloseLobby(code string, message string) error
}

// Server emitted events
const (
	GAME_STATE  = "GAME_STATE"
	LOBBY_STATE = "LOBBY_STATE"
	MESSAGE     = "MESSAGE"
)

// User emitted events
const (
	SUBMIT_ANSWER = "SUBMIT_ANSWER"
	START_GAME    = "START_GAME"
)

type Event struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type LobbySettings struct {
	Name         string       `json:"name,omitempty"`
	Code         string       `json:"code,omitempty"`
	Private      bool         `json:"private,omitempty"`
	MaxPlayers   int          `json:"maxPlayers,omitempty"`
	GameSettings GameSettings `json:"gameSettings,omitempty"`
}
