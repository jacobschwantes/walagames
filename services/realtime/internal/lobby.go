package realtime

import "github.com/gorilla/websocket"

type Lobby interface {
	Player(userID string) (Player, error)
	Players() []*PlayerInfo
	Code() string
	Connect(conn *websocket.Conn, p Player)
	Register(p Player) error
	Run(lm LobbyManager)
	Broadcast(msg []byte)
}

type LobbyState struct {
	Code     string        `json:"code,omitempty"`
	Players  []Player      `json:"players,omitempty"`
	State    *GameState    `json:"state,omitempty"`
	Settings *GameSettings `json:"settings,omitempty"`
}

type LobbyManager interface {
	Lobby(code string) (Lobby, error)
	CreateLobby(g Game) (Lobby, string, error)
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
	CLOSE_LOBBY   = "CLOSE_LOBBY"
)

type Event struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
	Player  Player
}

type LobbySettings struct {
	Name         string       `json:"name,omitempty"`
	Code         string       `json:"code,omitempty"`
	Private      bool         `json:"private,omitempty"`
	MaxPlayers   int          `json:"maxPlayers,omitempty"`
	GameSettings GameSettings `json:"gameSettings,omitempty"`
}
