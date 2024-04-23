package game

import (
	"encoding/json"
	"fmt"
	"time"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

const (
	duration = 8
)

type quizblitz struct {
	lobby realtime.Lobby
	quiz  *realtime.Quiz
}

func QuizBlitz(lobby realtime.Lobby, quiz *realtime.Quiz) realtime.Game {
	return &quizblitz{lobby, quiz}
}

func (qb *quizblitz) Run() {

	ticker := time.NewTicker(duration * time.Second)
	defer func() {
		// Logic to end game
		fmt.Println("game routine ended")
		ticker.Stop()
	}()

	for {
		select {
		case <-ticker.C:
			msgBytes, _ := json.Marshal(&realtime.Event{
				Type:    realtime.MESSAGE,
				Payload: "Hello from the game routine!",
			})

			qb.lobby.Broadcast(msgBytes)
		}
	}

}

func (qb *quizblitz) HandleEvent(e *realtime.Event) {

}
