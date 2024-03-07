package lobby

import (
	"encoding/json"
	"fmt"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"

	"time"
)

const (
	duration = 8
)

func StartGame(l *realtime.Lobby) {

	l.Game = realtime.NewGame("default", 10, 10)
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
	l.Game.CurrentRound = 1
	l.Game.State.SubmittedAnswers = make(map[string]string)
	lobbyState := &realtime.LobbyState{
		State: &realtime.GameState{
			Question:     questionBank[l.Game.CurrentRound-1].Question,
			Answers:      questionBank[l.Game.CurrentRound-1].Answers,
			Expiration:   time.Now().Unix() + duration,
			CurrentRound: l.Game.CurrentRound,
		}, Players: GetPlayerList(l)}

	state, _ := json.Marshal(&realtime.Event{Type: "GAME_STATE", Payload: lobbyState})

	l.Broadcast <- state
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
		case command := <-l.Game.Control:
			// Logic to handle pause
			switch command {
			case "PAUSE":
				ticker.Stop()
				BroadcastServerMessage(l, "Host paused the game")
				fmt.Println("Host paused the game")
			case "RESUME":
				ticker = time.NewTicker(duration * time.Second)
				BroadcastServerMessage(l, "Host resumed the game")
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
			JudgeAnswers(l, questionBank[l.Game.CurrentRound-1].CorrectAnswer)
			l.Game.CurrentRound++
			l.Game.State.SubmittedAnswers = make(map[string]string)
			lobbyState := &realtime.LobbyState{
				State: &realtime.GameState{
					Question: questionBank[l.Game.CurrentRound-1].Question,
					Answers:  questionBank[l.Game.CurrentRound-1].Answers,

					Expiration:   time.Now().Unix() + duration,
					CurrentRound: l.Game.CurrentRound,
				},
				Players: GetPlayerList(l),
			}

			state, _ := json.Marshal(&realtime.Event{Type: "GAME_STATE", Payload: lobbyState})

			l.Broadcast <- state

			if l.Game.CurrentRound >= l.Game.TotalRounds {
				// Logic to handle end of game
				// g.Lobby.BroadcastServerMessage("Game ended")
				for c := range l.Clients {
					c.PlayerInfo.Score = 0
				}
				l.Game.CurrentRound = 1
				lobbyState := &realtime.LobbyState{
					State: &realtime.GameState{
						CurrentRound: l.Game.CurrentRound,
					},
				}
				state, _ := json.Marshal(&realtime.Event{Type: "GAME_STATE", Payload: lobbyState})
				l.Broadcast <- state
				return
			}

		}
	}

}

func JudgeAnswers(l *realtime.Lobby, correctAnswer string) {
	// Logic to judge answers
	fmt.Println("Judging answers")

	for client := range l.Clients {

		if l.Game.State.SubmittedAnswers[client.PlayerInfo.Username] == correctAnswer {
			client.PlayerInfo.Score++
		}
	}

}
