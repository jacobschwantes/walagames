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

	l.Game = realtime.NewGame("default", len(l.Quiz.Questions), 10)

	ticker := time.NewTicker(duration * time.Second)
	l.Game.State.CurrentRound = 1
	l.Game.State.SubmittedAnswers = make(map[string]string)
	lobbyState := &realtime.LobbyState{
		State: &realtime.GameState{
			Question:     l.Quiz.Questions[l.Game.State.CurrentRound-1],
			Deadline:     time.Now().Unix() + duration,
			CurrentRound: l.Game.State.CurrentRound,
		}, Players: GetPlayerList(l),
		Settings: &realtime.GameSettings{
			TotalRounds:   l.Game.Settings.TotalRounds,
			RoundDuration: l.Game.Settings.RoundDuration,
		},
		Code: l.Code,
	}

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
			var correctAnswer string
			for _, a := range l.Quiz.Questions[l.Game.State.CurrentRound-1].Answers {
				if a.Correct {
					correctAnswer = a.Text
				}
			}

			JudgeAnswers(l, correctAnswer)
			l.Game.State.SubmittedAnswers = make(map[string]string)
			l.Game.State.CurrentRound++
		

			if l.Game.State.CurrentRound > l.Game.Settings.TotalRounds {
				// Logic to handle end of game
				// g.Lobby.BroadcastServerMessage("Game ended")
				for c := range l.Clients {
					c.PlayerInfo.Score = 0
				}
				l.Game.State.CurrentRound = 1
				lobbyState := &realtime.LobbyState{
					State: &realtime.GameState{
						CurrentRound: l.Game.State.CurrentRound,
					},
				}
				state, _ := json.Marshal(&realtime.Event{Type: "GAME_STATE", Payload: lobbyState})
				l.Broadcast <- state
				return
			}

				lobbyState := &realtime.LobbyState{
				State: &realtime.GameState{
					Question:     l.Quiz.Questions[l.Game.State.CurrentRound-1],
					Deadline:     time.Now().Unix() + duration,
					CurrentRound: l.Game.State.CurrentRound,
				},
				Settings: &realtime.GameSettings{
					TotalRounds:   l.Game.Settings.TotalRounds,
					RoundDuration: l.Game.Settings.RoundDuration,
				},
				Players: GetPlayerList(l),
			}
			state, _ := json.Marshal(&realtime.Event{Type: "GAME_STATE", Payload: lobbyState})

			l.Broadcast <- state
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
