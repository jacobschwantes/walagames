package stream

import (
	"net/http"
	"sync"

	// "sync/atomic"

	api "github.com/jacobschwantes/quizblitz/services/api/internal"
	"github.com/r3labs/sse/v2"
)

type streamSession struct {
	// consumerCount  atomic.Uint32
	onlineFriends  []string
	offlineFriends []string
	mu             sync.Mutex
}

type streamManager struct {
	sessions sync.Map
	srv      *sse.Server
}



func NewManager() api.StreamManager {
	return &streamManager{
		sessions: sync.Map{},
		srv:      sse.New(),
	}
}

func (sm *streamManager) Serve(w http.ResponseWriter, r *http.Request, userID string, friends []string) error {
	_, exists := sm.sessions.Load(userID)
	if !exists {
		sm.srv.CreateStream(userID)

		s := &streamSession{
			onlineFriends:  make([]string, 0),
			offlineFriends: make([]string, 0),
		}

		for _, friend := range friends {
			if _, exists := sm.sessions.Load(friend); exists {
				s.onlineFriends = append(s.onlineFriends, friend)
			} else {
				s.offlineFriends = append(s.offlineFriends, friend)
			}
		}
		// s.consumerCount.Add(1)
		sm.sessions.Store(userID, s)
	}

	// s.(*streamSession).consumerCount.Add(1)
	sm.srv.ServeHTTP(w, r)
	return nil
}
func (sm *streamManager) Publish(userID string, msg []byte) error {
	return nil
}
