package game

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type quizblitz struct {
	quiz           *realtime.Quiz
	event          chan *realtime.Event
	scores         map[realtime.Player]int
	answers        map[realtime.Player]playerAnswer
	currentRound   int
	totalRounds    int
	roundDuration  int
	roundStartedAt time.Time
}

type playerAnswer struct {
	answerID  string
	timeTaken float32
}

func QuizBlitz(quiz *realtime.Quiz) realtime.Game {
	return &quizblitz{
		quiz:          quiz,
		event:         make(chan *realtime.Event, 5), // event buffer size of 5
		totalRounds:   len(quiz.Questions),
		roundDuration: 15,
	}
}

func (qb *quizblitz) Run(ctx context.Context, l realtime.Lobby) {
	fmt.Println("Game routine started: ", l.Code())
	roundTimer := time.NewTimer(time.Duration(qb.roundDuration+7) * time.Second)
	judgeTimer := time.NewTimer(time.Duration(qb.roundDuration+2) * time.Second)

	qb.start(l)

	defer func() {
		fmt.Println("Game routine exited: ", l.Code())
		roundTimer.Stop()
		judgeTimer.Stop()
	}()

	for {
		select {
		case <-ctx.Done():
			return
		case e := <-qb.event:
			fmt.Printf("recv event in game routine of type %s from player %s\n", e.Type, e.Player.ID())
			l.Broadcast(msg("we got your event!"))
			qb.handleEvent(e)
		case <-judgeTimer.C:
			fmt.Println("judge timer")
			qb.judgeAnswers()
			l.Broadcast(qb.scoresMsg())
			qb.currentRound++
		case <-roundTimer.C:
			fmt.Println("round timer")

			if qb.currentRound == qb.totalRounds {
				qb.end(l)
				return
			}

			roundMsg := qb.questionMsg()
			l.Broadcast(roundMsg)
			qb.roundStartedAt = time.Now()
			roundTimer.Reset(time.Duration(qb.roundDuration+7) * time.Second)
			judgeTimer.Reset(time.Duration(qb.roundDuration+2) * time.Second)
		}
	}

}

func (qb *quizblitz) start(l realtime.Lobby) {
	fmt.Println("Game started")
	qb.roundStartedAt = time.Now()
	qb.scores = make(map[realtime.Player]int)
	qb.answers = make(map[realtime.Player]playerAnswer)
	qb.currentRound = 0
	type startMsg struct {
		Question      realtime.Question `json:"question"`
		RoundDuration int               `json:"roundDuration"`
		CurrentRound  int               `json:"currentRound"`
		TotalRounds   int               `json:"totalRounds"`
	}
	roundOneMsg := startMsg{
		Question:      qb.quiz.Questions[0],
		RoundDuration: qb.roundDuration,
		CurrentRound:  0,
		TotalRounds:   qb.totalRounds,
	}
	roundOneBytes, _ := json.Marshal(&realtime.Event{
		Type:    realtime.GAME_START,
		Payload: roundOneMsg,
	})
	l.Broadcast(roundOneBytes)
}

func (qb *quizblitz) end(l realtime.Lobby) {
	fmt.Println("Game ended")
	endBytes, _ := json.Marshal(&realtime.Event{
		Type: realtime.GAME_OVER,
	})

	l.Broadcast(endBytes)
}

func (qb *quizblitz) questionMsg() []byte {
	type newRoundMsg struct {
		Question realtime.Question `json:"question"`
	}

	questionBytes, _ := json.Marshal(&realtime.Event{
		Type:    realtime.NEW_ROUND,
		Payload: &newRoundMsg{Question: qb.quiz.Questions[qb.currentRound]},
	})
	return questionBytes
}

func (qb *quizblitz) scoresMsg() []byte {
	var correctAnswerID string

	// find id of correct answer
	for _, a := range qb.quiz.Questions[qb.currentRound].Answers {
		log.Println("answer:", a.ID, a.Correct)
		if a.Correct {
			correctAnswerID = a.ID
			break
		}
	}
	type scores struct {
		Scores        map[string]int `json:"scores"`
		CorrectAnswer string         `json:"correctAnswer"`
	}

	scoreMsg := &scores{
		Scores:        make(map[string]int),
		CorrectAnswer: correctAnswerID,
	}

	for p, s := range qb.scores {
		scoreMsg.Scores[p.ID()] = s
	}

	scoresBytes, _ := json.Marshal(&realtime.Event{
		Type:    realtime.UPDATE_SCORES,
		Payload: scoreMsg,
	})
	return scoresBytes
}

func (qb *quizblitz) judgeAnswers() {
	var correctAnswerID string

	// find id of correct answer
	for _, a := range qb.quiz.Questions[qb.currentRound].Answers {
		log.Println("answer:", a.ID, a.Correct)
		if a.Correct {
			correctAnswerID = a.ID
			break
		}
	}

	log.Println("correct answer id:", correctAnswerID)

	// check if player answered correctly, increment score if so
	for p, a := range qb.answers {
		if a.answerID == correctAnswerID {
			score := qb.calculateScore(a)
			log.Println("player", p.ID(), " answered ", a.answerID, " and", " scored ", score, " points")
			qb.scores[p] += score
		}
	}
}

func (qb *quizblitz) calculateScore(a playerAnswer) int {
	timeTaken := (float32(qb.roundDuration) - a.timeTaken) / float32(qb.roundDuration)

	if timeTaken < 0.0 {
		timeTaken = 0
	}

	return int(timeTaken * 100.0)
}

func (qb *quizblitz) handleEvent(e *realtime.Event) {
	switch e.Type {
	case realtime.SUBMIT_ANSWER:
		answer := playerAnswer{
			answerID:  e.Payload.(string),
			timeTaken: float32(time.Since(qb.roundStartedAt).Milliseconds() / 1000),
		}
		qb.answers[e.Player] = answer
	}
}

func (qb *quizblitz) PushEvent(e *realtime.Event) {
	select {
	case qb.event <- e:
		fmt.Println("sent event to chan in game")
	default:
		fmt.Println("dropped event in game chan")
	}

}

func msg(m string) []byte {
	msgBytes, _ := json.Marshal(&realtime.Event{
		Type:    realtime.MESSAGE,
		Payload: m,
	})
	return msgBytes
}
