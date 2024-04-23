package realtime

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
	// ID() string
	Send(msg []byte) error
	Run()
	Close() error
}
