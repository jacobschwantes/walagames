package models

import (
	"encoding/json"
	"fmt"
	"time"
)

type Message struct {
	Username  string `json:"username"`
	Message   string `json:"message"`
	ImageURL  string `json:"imageURL"`
	Timestamp int64  `json:"timestamp"`
}

// TODO: store a players slice in the game state
// record answers and scores inthe player struct
// this should be separate from list of clients
// i want a user to be able to disconnect and then join back and resume
// where they left off. we will store a table of lobbies they are in without a timer
// to join back using redis

type Game struct {
	Lobby        *Lobby
	Mode         string
	State        *GameState
	Settings     *GameSettings
	CurrentRound int
	TotalRounds  int
	Control      chan string
}

func HandlePlayerAction(c *Client, event Event) {

	switch event.Type {
	case "SEND_MESSAGE":
		// Logic to handle new message
		fmt.Println("Received message from client:", event.Payload)

		// Construct message
		msg := &Message{
			Username:  c.User.Username,
			ImageURL:  c.User.ImageURL,
			Message:   event.Payload.(string),
			Timestamp: time.Now().Unix(),
		}
		event := &Event{
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
		c.Lobby.Game.State.SubmittedAnswers[c.User.Username] = event.Payload.(string)

	case "START_GAME":
		// Logic to handle start game
		fmt.Println("Received start game from client:", event.Payload)

		go c.Lobby.Game.StartGame()
		c.Lobby.BroadcastServerMessage("Host started the game")

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

const (
	duration = 8
)

func (g *Game) StartGame() {
	// Logic to start game
	type Question struct {
		Question      string
		Answers       []string
		CorrectAnswer string
	}
	questionBank := []Question{
		{Question: "What is the capital of France?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Paris"},
		{Question: "What is the capital of Germany?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Berlin"},
		{Question: "What is the capital of Spain?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Madrid"},
		{Question: "What is the capital of Italy?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Rome"},
		{Question: "What is the capital of Portugal?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Lisbon"},
		{Question: "What is the capital of Greece?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Athens"},
		{Question: "What is the capital of Poland?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Warsaw"},
		{Question: "What is the capital of Sweden?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Stockholm"},
		{Question: "What is the capital of Norway?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Oslo"},
		{Question: "What is the capital of Finland?", Answers: []string{"Paris", "London", "Berlin", "Madrid"}, CorrectAnswer: "Helsinki"},
	}
	ticker := time.NewTicker(duration * time.Second)
	g.CurrentRound = 1
	g.State.SubmittedAnswers = make(map[string]string)
	lobbyState := &LobbyState{
		State: &GameState{
			Question:     questionBank[g.CurrentRound-1].Question,
			Answers:      questionBank[g.CurrentRound-1].Answers,
			Expiration:   time.Now().Unix() + duration,
			CurrentRound: g.CurrentRound,
		}, Players: g.Lobby.GetPlayerList()}

	state, _ := json.Marshal(&Event{Type: "GAME_STATE", Payload: lobbyState})

	g.Lobby.Broadcast <- state
	defer func() {
		// Logic to end game
		fmt.Println("game routine ended")
		ticker.Stop()
	}()

	for {
		// Logic to run game
		select {
		// case question := <-g.questionSet.Questions:
		// 	// Logic to handle new question
		// 	fmt.Println("Received new question:", question)
		case command := <-g.Control:
			// Logic to handle pause
			switch command {
			case "PAUSE":
				ticker.Stop()
				g.Lobby.BroadcastServerMessage("Host paused the game")
				fmt.Println("Host paused the game")
			case "RESUME":
				ticker = time.NewTicker(duration * time.Second)
				g.Lobby.BroadcastServerMessage("Host resumed the game")
				fmt.Println("Host resumed the game")
			case "END_GAME":
				fmt.Println("Host ended the game")
				ticker.Stop()
				return
			default:
				fmt.Println("Unknown command:", command)
			}
		case <-ticker.C:
			// Logic to handle end of round
			// fmt.Println("Round %s ended", g.CurrentRound)
			g.JudgeAnswers(questionBank[g.CurrentRound-1].CorrectAnswer)
			g.CurrentRound++
			g.State.SubmittedAnswers = make(map[string]string)
			lobbyState := &LobbyState{
				State: &GameState{
					Question: questionBank[g.CurrentRound-1].Question,
					Answers:  questionBank[g.CurrentRound-1].Answers,

					Expiration:   time.Now().Unix() + duration,
					CurrentRound: g.CurrentRound,
				},
				Players: g.Lobby.GetPlayerList(),
			}

			state, _ := json.Marshal(&Event{Type: "GAME_STATE", Payload: lobbyState})

			g.Lobby.Broadcast <- state

			if g.CurrentRound >= g.TotalRounds {
				// Logic to handle end of game
				// g.Lobby.BroadcastServerMessage("Game ended")
				for client := range g.Lobby.Clients {
					client.User.Score = 0
				}
				g.CurrentRound = 1
				lobbyState := &LobbyState{
					State: &GameState{
						CurrentRound: g.CurrentRound,
					},
				}
				state, _ := json.Marshal(&Event{Type: "GAME_STATE", Payload: lobbyState})
				g.Lobby.Broadcast <- state
				return
			}

		}
	}

}

func (g *Game) JudgeAnswers(correctAnswer string) {
	// Logic to judge answers
	fmt.Println("Judging answers")

	for client := range g.Lobby.Clients {

		if g.Lobby.Game.State.SubmittedAnswers[client.User.Username] == correctAnswer {
			client.User.Score++
		}
	}

}
