package realtime

import "context"


type Game interface {
	Run(ctx context.Context, l Lobby)
	PushEvent(e *Event)
}


