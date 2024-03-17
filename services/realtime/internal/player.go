package realtime

import (
	"github.com/gorilla/websocket"
)

type PlayerRole string

const (
	RoleHost                PlayerRole = "host"
	RoleAuthenticatedPlayer PlayerRole = "authenticated_player"
	RoleGuestPlayer         PlayerRole = "guest_player"
)

type PlayerStatus string

const (
	Connecting   PlayerStatus = "connecting"
	Connected    PlayerStatus = "connected"
	Disconnected PlayerStatus = "disconnected"
	Kicked       PlayerStatus = "kicked"
	Banned       PlayerStatus = "banned"
)

// Player represents a user in a game, whether registered, guest, or a host.
type Player struct {
	ID            string       `json:"id"`                 // Unique identifier for the user
	Username      string       `json:"username"`           // Username of the user
	ImageURL      string       `json:"imageURL,omitempty"` // URL to the user's profile image
	Role          PlayerRole   `json:"role"`               // Role of the user in the system
	Score         int          `json:"score"`              // Player's score in the game
	Authenticated bool         `json:"authenticated"`      // Whether the user is authenticated (registered)
	Status        PlayerStatus `json:"status"`             // Status of the player in the game
}

type Client struct {
	Lobby      *Lobby // Change from hub to lobby
	Conn       *websocket.Conn
	Send       chan []byte
	Close      chan struct{}
	PlayerInfo *Player
}

func NewClient(lobby *Lobby, conn *websocket.Conn, player *Player) *Client {
	return &Client{
		Lobby:      lobby,
		Conn:       conn,
		Send:       make(chan []byte, 256),
		Close:      make(chan struct{}),
		PlayerInfo: player,
	}
}