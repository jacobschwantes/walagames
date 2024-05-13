package realtime

import "github.com/gorilla/websocket"

type Lobby interface {
	Player(userID string) Player
	Players() []*PlayerInfo
	Code() string
	Connect(conn *websocket.Conn, userID string) error
	Register(p PlayerProfile, r PlayerRole) error
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

type LobbyEventType string

// Server emitted events
const (
	LOBBY_STATE LobbyEventType = "LOBBY_STATE"
	MESSAGE     LobbyEventType = "MESSAGE"
)

// User emitted events
const (
	START_GAME  LobbyEventType = "START_GAME"
	CLOSE_LOBBY LobbyEventType = "CLOSE_LOBBY"
)

type Event struct {
	Type    LobbyEventType `json:"type"`
	Payload interface{}    `json:"payload"`
	Player  Player
}

type LobbySettings struct {
	Name         string       `json:"name,omitempty"`
	Code         string       `json:"code,omitempty"`
	Private      bool         `json:"private,omitempty"`
	MaxPlayers   int          `json:"maxPlayers,omitempty"`
	GameSettings GameSettings `json:"gameSettings,omitempty"`
}
