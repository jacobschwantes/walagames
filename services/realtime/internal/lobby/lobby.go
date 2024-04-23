package lobby

import (
	"encoding/json"
	"fmt"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type lobby struct {
	code       string
	players    map[string]*realtime.Player
	connect    chan *realtime.Client
	disconnect chan *realtime.Client
	register   chan *realtime.Player
	unregister chan *realtime.Player
	event      chan *realtime.Event
	game       realtime.Game
}

func (l *lobby) Player(userID string) (*realtime.Player, error) {
	// TODO: look up player if not allowed in, return nil + error msg
	if player, exists := l.players[userID]; exists {
		return player, nil
	}
	return nil, fmt.Errorf("player does not exist")
}

func (l *lobby) Players() []*realtime.Player {
	players := []*realtime.Player{}
	for _, player := range l.players {
		players = append(players, player)
	}
	return players
}

func (l *lobby) Code() string {
	return l.code
}

func (l *lobby) SetGame(g realtime.Game) {
	l.game = g
}

func (l *lobby) Connect(userID string, c realtime.Client) error {
	// todo: validation (check routes for cases we need to account for)
	player, err := l.Player(userID)
	if err != nil {
		return err
	}

	c.Run()

	player.Client = c
	player.Status = realtime.StatusConnected
	type stateUpdate struct {
		Players []*realtime.Player `json:"players"`
		Code    string             `json:"code"`
	}

	msgBytes, _ := json.Marshal(&realtime.Event{
		Type: realtime.LOBBY_STATE,
		Payload: &stateUpdate{
			Players: l.Players(),
			Code:    l.code,
		},
	})

	c.Send(msgBytes)

	msgBytes, _ = json.Marshal(&realtime.Event{
		Type:    realtime.MESSAGE,
		Payload: "Welcome to the lobby!",
	})

	c.Send(msgBytes)

	return nil
}

func (l *lobby) Disconnect(userID string) {
	player, err := l.Player(userID)
	if err != nil {
		fmt.Println(err)
	}

	player.Client.Close()

	player.Status = realtime.StatusDisconnected
	// player.Client = nil // !scary
}

func (l *lobby) RegisterPlayer(p *realtime.Player) error {
	// todo: validation (check routes for cases we need to account for)
	l.players[p.ID] = p
	return nil
}

// TODO
func (l *lobby) PushEvent(userID string, e realtime.Event) {
	switch e.Type {
	case realtime.START_GAME:
		go l.game.Run()
	default:
		fmt.Println("unknown event")
	}
}

func (l *lobby) Broadcast(msg []byte) {
	for _, player := range l.players {
		player.Client.Send(msg)
	}
}

// TODO
func (l *lobby) Run() {

	for {
		select {
		case client := <-l.connect:
			fmt.Println(client)

			// case client := <-l.Disconnect:

			// case player := <-l.Register:

			// case player := <-l.Unregister:

			// case player := <-l.Kick:

		}
	}
}
