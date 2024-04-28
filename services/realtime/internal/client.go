package realtime

import "context"

// import (
// 	"github.com/gorilla/websocket"
// )

// type Client struct {
// 	ID    string
// 	// Lobby *Lobby
// 	Conn  *websocket.Conn
// 	Send  chan []byte
// }

type Client interface {
	Send(msg []byte) error
	Run(ctx context.Context)
	Close()
}
