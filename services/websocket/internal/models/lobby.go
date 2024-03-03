package models

import (
	"encoding/json"
	"fmt"
)

type Lobby struct {
	// Registered clients
	Clients map[*Client]bool

	// Send message to all clients
	Broadcast chan []byte

	// Register requests from clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	Code string

	Game *Game
}


func NewLobby(code string) *Lobby {
	lobby := &Lobby{
		Broadcast:  make(chan []byte),
		Register:   make(chan *Client),
		Unregister: make(chan *Client),
		Clients:    make(map[*Client]bool),
		Code:       code,
		Game: &Game{
			Mode:    "default",
			Control: make(chan string),
			State: &GameState{
				SubmittedAnswers: make(map[string]string),
				CurrentRound:     1,
			},
			CurrentRound: 1,
			TotalRounds:  10,
			Settings: &GameSettings{
				Mode:        "default",
				TotalRounds: 10,
				RoundLength: 8,
			},
		},
	}
	lobby.Game.Lobby = lobby
	return lobby
}

// type LobbyInterface interface {
// 	Run()
// 	BroadcastToAll(message string)
// 	Register(client *Client)
// 	Unregister(client *Client)
// }

type LobbyRepository interface {
	GetLobbyByCode(code string) (*Lobby, error)
	CreateLobby() (*Lobby, error)
	CloseLobby(code string, message string) error
}

type GameState struct {
	Question         string            `json:"question,omitempty"`
	Expiration       int64             `json:"expiration,omitempty"`
	CurrentRound     int               `json:"currentRound,omitempty"`
	Answers          []string          `json:"answers,omitempty"`
	SubmittedAnswers map[string]string `json:"-"`
}

type GameSettings struct {
	Mode        string `json:"mode,omitempty"`
	TotalRounds int    `json:"totalRounds,omitempty"`
	RoundLength int    `json:"roundLength,omitempty"`
}

type LobbyState struct {
	Code     string        `json:"code,omitempty"`
	Players  []Player      `json:"players,omitempty"`
	State    *GameState    `json:"state,omitempty"`
	Settings *GameSettings `json:"settings,omitempty"`
}

func (l *Lobby) Run(lobbyRepo LobbyRepository) {
	for {
		select {
		case client := <-l.Register:
			l.RegisterClient(client)

			players := l.GetPlayerList()
			playerList, _ := json.Marshal(&Event{Type: "PLAYER_LIST", Payload: players})

			l.BroadcastToAll(playerList)

			lobbyState := LobbyState{
				Code:     l.Code,
				Players:  l.GetPlayerList(),
				State:    l.Game.State,
				Settings: l.Game.Settings,
			}

			msg, _ := json.Marshal(&Event{Type: "LOBBY_STATE", Payload: lobbyState})

			client.Send <- msg
		case client := <-l.Unregister:
			l.UnregisterClient(client)

			if len(l.Clients) == 0 {
				lobbyRepo.CloseLobby(l.Code, "Empty lobby")
				fmt.Println(fmt.Sprintf("No users left so lobby %s was closed", l.Code))
			}
			if client.User.Role == RoleHost {
				l.MigrateHost(lobbyRepo)
			}
			players := l.GetPlayerList()
			playerList, _ := json.Marshal(&Event{Type: "PLAYER_LIST", Payload: players})

			l.BroadcastToAll(playerList)
		case message := <-l.Broadcast:
			l.BroadcastToAll(message)
		}
	}
}

func (l *Lobby) BroadcastToAll(message []byte) {
	for client := range l.Clients {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(l.Clients, client)
		}
	}
}

func (l *Lobby) BroadcastServerMessage(message string) {
	msg, _ := json.Marshal(&Event{Type: "SERVER_MESSAGE", Payload: message})
	fmt.Println("Broadcasting server message:", message)
	l.BroadcastToAll(msg)
}

func (l *Lobby) RegisterClient(client *Client) {
	// TODO: Check if the lobby is full, perms, etc
	// TODO: close the connection if the lobby is full
	l.BroadcastServerMessage(fmt.Sprintf("%s has joined the lobby", client.User.Username))

	fmt.Println(fmt.Sprintf("Player %s registered to lobby %s", client.User.Username, l.Code))
	fmt.Println(fmt.Sprintf("Lobby %s has %d players", l.Code, len(l.Clients)+1))
	if client.User.authenticated {
		fmt.Println(fmt.Sprintf("Player %s is authenticated", client.User.Username))
	}
	l.Clients[client] = true
}

func (l *Lobby) UnregisterClient(client *Client) {
	if _, ok := l.Clients[client]; ok {
		l.BroadcastServerMessage(fmt.Sprintf("%s has left the lobby", client.User.Username))

		delete(l.Clients, client)
		close(client.Send)
		fmt.Println(fmt.Sprintf("Player %s has left lobby %s", client.User.Username, l.Code))
	}
}

func (l *Lobby) MigrateHost(lobbyRepo LobbyRepository) {
	for client := range l.Clients {
		if client.User.authenticated {
			client.User.Role = RoleHost
			l.BroadcastServerMessage(fmt.Sprintf("%s is now the host", client.User.Username))
			fmt.Println(fmt.Sprintf("Player %s is now the host of lobby %s", client.User.Username, l.Code))
			lobbyState := LobbyState{

				Players: l.GetPlayerList(),
			}

			msg, _ := json.Marshal(&Event{Type: "LOBBY_STATE", Payload: lobbyState})
			client.Send <- msg
			return
		}
	}

	// close lobby if no host found
	lobbyRepo.CloseLobby(l.Code, "No host found, lobby closed")
	fmt.Println(fmt.Sprintf("No host found so lobby %s was closed", l.Code))
}

func (l *Lobby) GetPlayerList() []Player {
	players := []Player{}
	for c := range l.Clients {
		players = append(players, *c.User)
	}
	return players
}
