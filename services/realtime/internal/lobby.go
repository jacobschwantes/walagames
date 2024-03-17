package realtime

import (
	"crypto/rand"
	"time"
)

type Lobby struct {
	ID int `json:"id,omitempty"`
	// Registered clients
	Clients map[*Client]bool

	// Send message to all clients
	Broadcast chan []byte

	// Register requests from clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	Code string

	LastActivity time.Time

	Game *Game
}

// TODO: remake this / move to its own dependency
func generateLobbyID() (int, error) {
	b := make([]byte, 4)
	_, err := rand.Read(b)
	if err != nil {
		return 0, err
	}
	return int(b[0]) + int(b[1])<<8 + int(b[2])<<16 + int(b[3])<<24, nil
}

func NewLobby(code string) (*Lobby, error) {
	id, err := generateLobbyID()
	if err != nil {
		return nil, err
	}
	return &Lobby{
		ID:         id,
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
		Code:       code,
		LastActivity: time.Now(),
	}, nil
}

type LobbyState struct {
	Code     string        `json:"code,omitempty"`
	Players  []Player      `json:"players,omitempty"`
	State    *GameState    `json:"state,omitempty"`
	Settings *GameSettings `json:"settings,omitempty"`
}

type LobbyManager interface {
	Lobby(code string) (*Lobby, error)
	CreateLobby(code string) (*Lobby, error)
	CloseLobby(code string, message string) error
}

type LobbyRepository interface {
	Lobby(code string) (*Lobby, error)
	Lobbies() []*Lobby
	InsertLobby(lobby *Lobby) error
	UpdateLobby(code string, lobby *Lobby) error
	DeleteLobby(code string) error
}

// Server emitted events
const (
	NEW_MESSAGE = "NEW_MESSAGE"
	GAME_STATE  = "GAME_STATE"
	LOBBY_STATE = "LOBBY_STATE"
)

// User emitted events
const (
	SEND_MESSAGE  = "SEND_MESSAGE"
	SUBMIT_ANSWER = "SUBMIT_ANSWER"
	START_GAME    = "START_GAME"
)

type PlayerMessage struct {
	Username  string `json:"username"`
	Message   string `json:"message"`
	ImageURL  string `json:"imageURL"`
	Timestamp int64  `json:"timestamp"`
}

func NewPlayerMessage(p *Player, message string) *PlayerMessage {
	return &PlayerMessage{
		Username:  p.Username,
		Message:   message,
		ImageURL:  p.ImageURL,
		Timestamp: time.Now().Unix(),
	}
}

type Event struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

func NewEvent(eventType string, payload interface{}) *Event {
	return &Event{
		Type:    eventType,
		Payload: payload,
	}
}
