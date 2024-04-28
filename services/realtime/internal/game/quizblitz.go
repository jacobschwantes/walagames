package game

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

const (
	duration = 8
)

type quizblitz struct {
	quiz  *realtime.Quiz
	event chan *realtime.Event
}

func QuizBlitz(quiz *realtime.Quiz) realtime.Game {
	return &quizblitz{
		quiz:  quiz,
		event: make(chan *realtime.Event, 5), // event buffer size of 5
	}
}

func (qb *quizblitz) Run(ctx context.Context, l realtime.Lobby) {
	fmt.Println("Game routine started: ", l.Code())
	ticker := time.NewTicker(duration * time.Second)
	defer func() {
		fmt.Println("Game routine exited: ", l.Code())
		ticker.Stop()
	}()

	for {
		select {
		case <-ctx.Done():
			return
		case e := <-qb.event:
			fmt.Printf("recv event in game routine of type %s from player %s\n", e.Type, e.Player.ID())
		case <-ticker.C:
			l.Broadcast(msg("Hello from the game routine!"))
		}
	}

}

func (qb *quizblitz) HandleEvent(e *realtime.Event) {
	qb.event <- e
}

func msg(m string) []byte {
	msgBytes, _ := json.Marshal(&realtime.Event{
		Type:    realtime.MESSAGE,
		Payload: m,
	})
	return msgBytes
}
