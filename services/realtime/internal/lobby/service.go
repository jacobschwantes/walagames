package lobby

import (
	"crypto/rand"
	"fmt"
	"time"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"sync"
)

type lobbyManager struct {
	repo            realtime.LobbyRepository
	cleanupInterval time.Duration
	maxLobbies      int
	timeout         time.Duration
	api             realtime.APIClient
	updateQueue     *LobbyUpdateQueue
}

const (
	MAX_LOBBIES      = 20
	LOBBY_TIMEOUT    = 15 * time.Minute
	CLEANUP_INTERVAL = 5 * time.Minute
)

func NewManager(c realtime.APIClient) realtime.LobbyManager {
	// *NOTE: In the future, we can inject the repository into the service instead of constructing it here
	repo := newLobbyRepository()
	q := NewLobbyUpdateQueue()
	lm := &lobbyManager{repo: repo, cleanupInterval: CLEANUP_INTERVAL, maxLobbies: MAX_LOBBIES, timeout: LOBBY_TIMEOUT, api: c, updateQueue: q}
	go lm.cleanupRoutine()
	go lm.lobbyStatePusher()
	return lm
}

func (ls *lobbyManager) CreateLobby(code string, quizID string) (*realtime.Lobby, error) {
	lobbyCount := len(ls.repo.Lobbies())
	fmt.Println("current lobby count: ", lobbyCount)

	if lobbyCount >= ls.maxLobbies {
		fmt.Println("max lobbies reached")
		return nil, fmt.Errorf("max lobbies reached")
	}

	fmt.Println("About to create new lobby")
	lobby, err := realtime.NewLobby(code, quizID)
	if err != nil {
		return nil, err
	}

	err = ls.repo.InsertLobby(lobby)
	if err != nil {
		return nil, err
	}

	quiz, err := ls.api.FetchQuiz(quizID)
	if err != nil {
		fmt.Println("failed to fetch quiz")
		return nil, err
	}

	lobby.Quiz = quiz

	go Run(ls, lobby)
	fmt.Println("Created lobby with code:", code)
	return lobby, nil
}

func (ls *lobbyManager) CloseLobby(code string, message string) error {
	if lobby, err := ls.repo.Lobby(code); err == nil {
		// lobby.Game.Control <- "END_GAME"
		for c := range lobby.Clients {
			close(c.Close)
		}
		fmt.Println("about to close lobby with code: ", code)
		err = ls.repo.DeleteLobby(code)
		if err != nil {
			fmt.Println("failed to delete lobby")
			return err
		}

		fmt.Println("lobby count after close: ", len(ls.repo.Lobbies()))

		return nil
	}
	return fmt.Errorf("lobby with id:%s not found", code)
}

func (ls *lobbyManager) Lobby(code string) (*realtime.Lobby, error) {
	return ls.repo.Lobby(code)
}

func (ls *lobbyManager) PushLobbyStateUpdate(update realtime.LobbyStateUpdate) {
	ls.updateQueue.PushUpdate(update)
}

// TODO: this should be chagned to handle checking whether the code exists or not before returning
// TODO: we could insert to redis with a key of the code and value of the lobby id (down the line, the server that the lobby is on as well), then we can check if the code exists or not
func generateLobbyCode(length int) (string, error) {
	const charset = "ABCDEFGHIJKLMNPQRSTUVWXYZ"
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i := 0; i < length; i++ {
		b[i] = charset[b[i]%byte(len(charset))]
	}
	return string(b), nil
}

func (lm *lobbyManager) cleanupRoutine() {
	ticker := time.NewTicker(lm.cleanupInterval)
	defer ticker.Stop()

	for {
		<-ticker.C
		now := time.Now()
		warnedCount := 0
		for _, l := range lm.repo.Lobbies() {
			last := now.Sub(l.LastActivity)
			if last >= lm.timeout-lm.cleanupInterval {
				if last >= lm.timeout {
					fmt.Println("Closing inactive lobby:", l.Code)
					lm.CloseLobby(l.Code, "Lobby closed due to inactivity")

					return
				}
				BroadcastServerMessage(l, fmt.Sprintf("Lobby will be closed due to inactivity in %s", lm.cleanupInterval))
				warnedCount++
			}
		}
		fmt.Printf("%d Lobbies active.\n%d are about to be closed for inactivity.\n", len(lm.repo.Lobbies()), warnedCount)
	}
}

func (lm *lobbyManager) lobbyStatePusher() {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		<-ticker.C
		updates := lm.updateQueue.PopAllUpdates()
		if len(updates) > 0 {
			fmt.Println("Pushing lobby state updates")
		}
		for _, update := range updates {
			fmt.Println("Pushing lobby state update for lobby:", update.Code)
			fmt.Println("Update:", update)
			lm.api.PushLobbyStateUpdate(update)
		}
	}
}

type LobbyUpdateQueue struct {
	mu      sync.Mutex
	updates map[string]realtime.LobbyStateUpdate
}

func NewLobbyUpdateQueue() *LobbyUpdateQueue {
	return &LobbyUpdateQueue{
		updates: make(map[string]realtime.LobbyStateUpdate),
	}
}

func (uq *LobbyUpdateQueue) PushUpdate(update realtime.LobbyStateUpdate) {
	uq.mu.Lock()
	defer uq.mu.Unlock()
	uq.updates[update.Code] = update
}

func (uq *LobbyUpdateQueue) PopAllUpdates() []realtime.LobbyStateUpdate {
	uq.mu.Lock()
	defer uq.mu.Unlock()
	var updates []realtime.LobbyStateUpdate
	for _, update := range uq.updates {
		updates = append(updates, update)
	}
	uq.updates = make(map[string]realtime.LobbyStateUpdate) // Clear the map
	return updates
}
