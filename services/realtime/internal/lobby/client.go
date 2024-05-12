package lobby

import (
	"context"
	"encoding/json"
	"fmt"

	// "os"

	"github.com/gorilla/websocket"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"golang.org/x/time/rate"

	"log"
	"time"
)

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

var (
	newline = []byte{'\n'}
	space   = []byte{' '}
)

type client struct {
	Player realtime.Player
	lobby  *lobby
	conn   *websocket.Conn
	send   chan []byte
	cancel context.CancelFunc
}

func newClient(conn *websocket.Conn, lobby *lobby, player realtime.Player) *client {
	return &client{
		Player: player,
		lobby:  lobby,
		conn:   conn,
		send:   make(chan []byte, 256),
	}
}

func (c *client) Run(lobbyCtx context.Context) {
	ctx, cancel := context.WithCancel(lobbyCtx)
	c.cancel = cancel

	ready := make(chan bool, 2)

	go c.read(ctx, ready)
	go c.write(ctx, ready)

	// block return until both go routines start
	<-ready
	<-ready
	c.Player.ChangeStatus(realtime.StatusConnected)
}

func (c *client) Send(msg []byte) error {
	c.send <- msg
	return nil
}

func (c *client) Close() {
	c.cancel()
}

// readPump pumps messages from the websocket connection to the lobby.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine
func (c *client) read(ctx context.Context, ready chan<- bool) {
	fmt.Println("Read routine started: ", c.Player.ID())
	ready <- true
	defer func() {
		c.Player.ChangeStatus(realtime.StatusDisconnected)
		c.conn.Close()
		c.Close()
		fmt.Println("Read routine exited: ", c.Player.ID())
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	limiter := rate.NewLimiter(0.5, 5) 

	for {
		select {
		case <-ctx.Done():
			return
		default:
			_, msgBytes, err := c.conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					// fmt.Println("error: ", err)
					return
				}
				return
			}
			if limiter.Allow() {
				var event realtime.Event
				if err := json.Unmarshal(msgBytes, &event); err != nil {
					log.Printf("Error un-marshalling message: %v", err)
					return
				}

				event.Player = c.Player

				c.lobby.event <- &event

				fmt.Println("sent event from client")

			} else {
				fmt.Println("dropped event")
			}

		}
	}
}

// writePump pumps messages from the lobby to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *client) write(ctx context.Context, ready chan<- bool) {
	fmt.Println("Write routine started: ", c.Player.ID())
	ready <- true
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
		fmt.Println("Write routine exited: ", c.Player.ID())
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
		case <-ctx.Done():
			return
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
