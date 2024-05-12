package lobby

import (
	"crypto/rand"
	"fmt"
	"time"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

// !!! Need to add lock to map operations
const (
	MAX_LOBBIES      = 20
	LOBBY_TIMEOUT    = 15 * time.Minute
	CLEANUP_INTERVAL = 5 * time.Minute
)

type lobbyManager struct {
	lobbies map[string]*lobby
	api     realtime.APIClient
}

func NewManager(api realtime.APIClient) realtime.LobbyManager {
	return &lobbyManager{
		lobbies: make(map[string]*lobby),
		api:     api,
	}
}

func (lm *lobbyManager) CreateLobby(g realtime.Game) (realtime.Lobby, string, error) {
	code, err := lm.uniqueLobbyCode()
	if err != nil {
		return nil, "", err
	}

	lobby := &lobby{
		code:       code,
		players:    make(map[realtime.Player]*client),
		connect:    make(chan *client),
		broadcast:  make(chan []byte),
		register:   make(chan realtime.Player),
		event:      make(chan *realtime.Event),
		game: g,
	}
	lm.lobbies[code] = lobby

	return lobby, code, nil
}

func (lm *lobbyManager) CloseLobby(code string, message string) error {
	if _, err := lm.Lobby(code); err == nil {
		delete(lm.lobbies, code)
		fmt.Printf("Lobby %s deleted: %s\n", code, message)
		return nil
	}

	return fmt.Errorf("lobby with code:%s not found", code)
}

func (lm *lobbyManager) Lobby(code string) (realtime.Lobby, error) {
	if lobby, ok := lm.lobbies[code]; ok {
		return lobby, nil
	}
	return nil, fmt.Errorf("lobby not found")
}

func (lm *lobbyManager) uniqueLobbyCode() (string, error) {
	code, err := generateRandomCode(4)
	if err != nil {
		return "", err
	}
	
	if _, ok := lm.lobbies[code]; ok {
		return lm.uniqueLobbyCode()
	}

	return code, nil
}

func generateRandomCode(length int) (string, error) {
	const charset = "ABCDEFGHIJKLNPQRSTUVWXYZ"
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i := 0; i < length; i++ {
		b[i] = charset[b[i]%byte(len(charset))]
	}
	return string(b), nil
}
