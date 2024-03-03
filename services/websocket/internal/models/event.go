package models

// Server emitted events
const (
	NEW_MESSAGE = "NEW_MESSAGE"
	GAME_STATE  = "GAME_STATE"
	LOBBY_STATE = "LOBBY_STATE"
)

// User emitted events
const (
	SEND_MESSAGE  = "SEND_MESSAGE"
	SUBMIT_ANSWER = "SUBMIT_ANSWER"
	START_GAME    = "START_GAME"
)

type Event struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

func NewEvent(eventType string, payload interface{}) *Event {
	return &Event{
		Type:    eventType,
		Payload: payload,
	}
}

