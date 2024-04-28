package lobby

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/gorilla/websocket"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type lobby struct {
	code       string
	players    map[realtime.Player]*client
	broadcast  chan []byte
	connect    chan *client
	register   chan realtime.Player
	event      chan *realtime.Event
	game       realtime.Game
}

func (l *lobby) Player(id string) (realtime.Player, error) {
	for p := range l.players {
		if p.ID() == id {
			if p.Status() == realtime.StatusKicked {
				return nil, errors.New("player was kicked")
			}
			return p, nil
		}
	}
	return nil, errors.New("player does not exist")
}

func (l *lobby) Players() []*realtime.PlayerInfo {
	playerList := []*realtime.PlayerInfo{}
	for player := range l.players {
		if player.Status() != realtime.StatusKicked {
			playerList = append(playerList, player.Info())
		}
	}
	return playerList
}

func (l *lobby) Code() string {
	return l.code // * safe - it will never change
}

func (l *lobby) Connect(conn *websocket.Conn, player realtime.Player) {
	client := newClient(conn, l, player)
	l.connect <- client
}

func (l *lobby) Register(player realtime.Player) error {
	// todo: check if there is room in the lobby
	l.register <- player
	return nil
}

func (l *lobby) Broadcast(msg []byte) {
	l.broadcast <- msg
}

func (l *lobby) Run(lm realtime.LobbyManager) {
	fmt.Println("Lobby routine started: ", l.code)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	ticker := time.NewTicker(time.Second * 30)

	defer func() {
		fmt.Println("Lobby routine exited: ", l.code)
		lm.CloseLobby(l.code, "lobby routine exited")
	}()
	for {
		select {
		case <-ctx.Done():
			for _, c := range l.players {
				c.Close()
			}
			return
		case player := <-l.register:
			l.players[player] = nil
			fmt.Println("Registered player: ", player.ID())
		case client := <-l.connect:
			client.Run(ctx)
			l.players[client.Player] = client
			
			fmt.Printf("%s connected: %s\n", client.Player.Info().Role, client.Player.Info().Profile.Username)

			msg := l.state(realtime.LOBBY_STATE)
			client.Send(msg)
		case msg := <-l.broadcast:
			for _, client := range l.players {
				client.Send(msg)
			}
		case e := <-l.event:
			fmt.Printf("recv event of type %s from player %s\n", e.Type, e.Player.ID())
			switch e.Type {
			case realtime.START_GAME:
				go l.game.Run(ctx, l)
			case realtime.CLOSE_LOBBY:
				cancel()
			default:
				l.game.HandleEvent(e)
			}
		case <-ticker.C:
			for p := range l.players {
				fmt.Printf("%s: %s is %s\n", p.Info().Role, p.Info().Profile.Username, p.Status())
			}
		}

	}
}

// * opportunity for generic ? or veratic
func (l *lobby) state(t string) []byte {
	type stateUpdate struct {
		Players []*realtime.PlayerInfo `json:"players"`
		Code    string                 `json:"code"`
	}

	switch t {
	case realtime.LOBBY_STATE:
		msgBytes, _ := json.Marshal(&realtime.Event{
			Type: realtime.LOBBY_STATE,
			Payload: &stateUpdate{
				Players: l.Players(),
				Code:    l.code,
			},
		})
		return msgBytes
	default:
		fmt.Println("unknown message type: ", t)
		return nil
	}

}
