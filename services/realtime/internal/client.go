package realtime

import (
	"github.com/gorilla/websocket"
)

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
