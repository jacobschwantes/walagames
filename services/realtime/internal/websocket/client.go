package websocket

import (
	"encoding/json"
	"fmt"
	// "os"

	"github.com/gorilla/websocket"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal"

	"log"
	"net/http"
	"time"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)


func UpgradeConnection(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	return upgrader.Upgrade(w, r, nil)
}

type client struct {
	id    string
	lobby realtime.Lobby
	conn  *websocket.Conn
	send  chan []byte
	close chan struct{}
}

func NewClient(conn *websocket.Conn, id string, lobby realtime.Lobby) realtime.Client {
	return &client{
		id:    id,
		lobby: lobby,
		conn:  conn,
		send:  make(chan []byte, 256),
		close: make(chan struct{}),
	}
}

func (c *client) Run() {
	// make wait group or sum and pass to them
	go c.read()
	go c.write()
}

func (c *client) Send(msg []byte) error {
	// TODO: validate msg or whatever
	c.send <- msg
	return nil
}

func (c *client) Close() error {
	// TODO: do whatever, logging
	close(c.close)
	c.conn.Close()
	return nil
}

// readPump pumps messages from the websocket connection to the lobby.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine
func (c *client) read() {
	fmt.Println("Read routine started for client: ", c.id)
	defer func() {
		c.lobby.Disconnect(c.id)
		fmt.Println("Read closed for client: ", c.id)
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, msgBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				// fmt.Println("error: ", err)
				return
			}
			return
		}

		var event realtime.Event

		if err := json.Unmarshal(msgBytes, &event); err != nil {
			log.Printf("Error un-marshalling message: %v", err)
			return
		}

		c.lobby.PushEvent(c.id, event)
	}
}

// writePump pumps messages from the lobby to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *client) write() {
	fmt.Println("Write routine started for client: ", c.id)
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		fmt.Println("Write closed for client: ", c.id)
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The lobby closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// TODO: reformat this to send multiple messages at once, switch to an array of events
			// Can reduce latency by sending multiple events / messages at once

			// Add queued messages to the current websocket message.
			// n := len(c.Send)
			// for i := 0; i < n; i++ {
			// 	w.Write(newline)
			// 	w.Write(<-c.Send)
			// }

			if err := w.Close(); err != nil {
				return
			}
		case <-c.close:
			return
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
