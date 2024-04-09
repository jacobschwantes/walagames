package lobby

import (
	"encoding/json"
	"fmt"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal"

	"time"
)

func HandlePlayerAction(c *realtime.Client, event realtime.Event) {

	switch event.Type {
		// ? we should use constants for these strings and classify them by event type
	case "JOIN_LOBBY":
		// Logic to handle player info
		fmt.Println("Received join lobby from client:", event.Payload)
		if c.PlayerInfo.Status == realtime.Connecting {

			fmt.Println("Received player info from client:", event.Payload)

			c.PlayerInfo.Status = realtime.Connected
			c.PlayerInfo.Username = event.Payload.(map[string]interface{})["username"].(string)
			HandlePlayerJoin(c)
		}
	case "SEND_MESSAGE":
		// Logic to handle new message
		fmt.Println("Received message from client:", event.Payload)

		// Construct message
		msg := &realtime.PlayerMessage{
			Username:  c.PlayerInfo.Username,
			ImageURL:  c.PlayerInfo.ImageURL,
			Message:   event.Payload.(string),
			Timestamp: time.Now().Unix(),
		}
		event := &realtime.Event{
			Type:    "NEW_MESSAGE",
			Payload: msg,
		}

		json, err := json.Marshal(event)

		if err != nil {
			fmt.Println("Error marshalling message:", err)
			return
		}

		c.Lobby.Broadcast <- json

	case "SUBMIT_ANSWER":
		// Logic to handle answer question

		fmt.Println("Received answer from client:", event.Payload)
		c.Lobby.Game.State.SubmittedAnswers[c.PlayerInfo.Username] = event.Payload.(string)

	case "START_GAME":
		// Logic to handle start game
		fmt.Println("Received start game from client:", event.Payload)

		go StartGame(c.Lobby)
		BroadcastServerMessage(c.Lobby, "Host started the game")

	case "PAUSE_GAME":
		// Logic to handle pause game
		fmt.Println("Received pause game from client:", event.Payload)
		c.Lobby.Game.Control <- "PAUSE"

	case "RESUME_GAME":
		// Logic to handle resume game
		fmt.Println("Received resume game from client:", event.Payload)
		c.Lobby.Game.Control <- "RESUME"

	default:
		// Logic to handle default
		fmt.Println("Received unknown event from client:", event.Type)
	}

}

func Run(lm realtime.LobbyManager, l *realtime.Lobby) {
	// gs := game.NewGameService()
	l.Game = realtime.NewGame("default", 10, 10)

	for {
		select {
		case client := <-l.Register:
			RegisterClient(client)
			lm.PushLobbyStateUpdate(realtime.LobbyStateUpdate{
				Code:        l.Code,
				PlayerCount: len(l.Clients),
				MaxPlayers:  10,
				HostServer:  "localhost:8081",
			})
		case client := <-l.Unregister:
			UnregisterClient(client)

			if len(l.Clients) == 0 {
				lm.CloseLobby(l.Code, "Empty lobby")
				fmt.Printf("No users left so lobby %s was closed", l.Code)
			}
			if client.PlayerInfo.Role == realtime.RoleHost {
				MigrateHost(lm, l)
			}
			players := GetPlayerList(l)
			playerList, _ := json.Marshal(&realtime.Event{Type: "PLAYER_LIST", Payload: players})

			BroadcastToAll(l, playerList)
		case message := <-l.Broadcast:
			BroadcastToAll(l, message)
		}
	}
}

func BroadcastToAll(l *realtime.Lobby, message []byte) {
	for client := range l.Clients {
		select {
		case client.Send <- message:
		default:
			close(client.Send)
			delete(l.Clients, client)
		}
	}
}

func BroadcastServerMessage(l *realtime.Lobby, message string) {
	msg, _ := json.Marshal(&realtime.Event{Type: "SERVER_MESSAGE", Payload: message})
	fmt.Println("Broadcasting server message:", message)
	BroadcastToAll(l, msg)
}

func RegisterClient(c *realtime.Client) {
	// TODO: Check if the lobby is full, perms, etc
	// TODO: close the connection if the lobby is full
	c.Lobby.Clients[c] = true
	if c.PlayerInfo.Status == realtime.Connected {
		HandlePlayerJoin(c)
	}
}

func UnregisterClient(c *realtime.Client) {
	if _, ok := c.Lobby.Clients[c]; ok {
		BroadcastServerMessage(c.Lobby, fmt.Sprintf("%s has left the lobby", c.PlayerInfo.Username))

		delete(c.Lobby.Clients, c)
		close(c.Send)
		fmt.Printf("Player %s has left lobby %s\b\n", c.PlayerInfo.Username, c.Lobby.Code)
	}
}

func MigrateHost(lm realtime.LobbyManager, l *realtime.Lobby) {
	for client := range l.Clients {
		if client.PlayerInfo.Authenticated {
			client.PlayerInfo.Role = realtime.RoleHost
			BroadcastServerMessage(l, fmt.Sprintf("%s is now the host", client.PlayerInfo.Username))
			fmt.Printf("Player %s is now the host of lobby %s", client.PlayerInfo.Username, l.Code)
			lobbyState := realtime.LobbyState{

				Players: GetPlayerList(l),
			}

			msg, _ := json.Marshal(&realtime.Event{Type: "LOBBY_STATE", Payload: lobbyState})
			client.Send <- msg
			return
		}
	}

	// close lobby if no host found
	lm.CloseLobby(l.Code, "No host found")
}

func GetPlayerList(l *realtime.Lobby) []realtime.Player {
	players := []realtime.Player{}
	for c := range l.Clients {
		players = append(players, *c.PlayerInfo)
	}
	return players
}

func HandlePlayerJoin(c *realtime.Client) {
	players := GetPlayerList(c.Lobby)
	playerList, _ := json.Marshal(&realtime.Event{Type: "PLAYER_LIST", Payload: players})

	BroadcastToAll(c.Lobby, playerList)
	BroadcastServerMessage(c.Lobby, fmt.Sprintf("%s has joined the lobby", c.PlayerInfo.Username))

	lobbyState := realtime.LobbyState{
		Code:     c.Lobby.Code,
		Players:  GetPlayerList(c.Lobby),
		State:    c.Lobby.Game.State,
		Settings: c.Lobby.Game.Settings,
	}

	msg, _ := json.Marshal(&realtime.Event{Type: "INITIAL_STATE", Payload: lobbyState})
	c.Send <- msg
}
