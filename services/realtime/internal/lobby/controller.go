package lobby

import (
	"crypto/rand"
	"fmt"
	"time"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)
// !!! Need to add lock to map operations
const (
	MAX_LOBBIES      = 20
	LOBBY_TIMEOUT    = 15 * time.Minute
	CLEANUP_INTERVAL = 5 * time.Minute
)

type lobbyController struct {
	lobbies map[string]*lobby
	api realtime.APIClient
}



func NewController(api realtime.APIClient) realtime.LobbyController {
	return &lobbyController{
		lobbies: make(map[string]*lobby),
		api:     api,
	}
}

func (lc *lobbyController) CreateLobby() (realtime.Lobby, error) {
	code, err := lc.uniqueLobbyCode()
	if err != nil {
		return nil, err
	}

	lobby := &lobby{
		code:       code,
		players:    make(map[string]*realtime.Player),
		connect:    make(chan *realtime.Client),
		disconnect: make(chan *realtime.Client),
		register:   make(chan *realtime.Player),
		unregister: make(chan *realtime.Player),
	}
	lc.lobbies[code] = lobby

	return lobby, nil
}

func (lc *lobbyController) CloseLobby(code string, message string) error {
	if _, err := lc.Lobby(code); err == nil {
		delete(lc.lobbies, code)
		return nil
	}

	return fmt.Errorf("lobby with code:%s not found", code)
}

func (lc *lobbyController) Lobby(code string) (realtime.Lobby, error) {
	if lobby, ok := lc.lobbies[code]; ok {
		return lobby, nil
	}
	return nil, fmt.Errorf("lobby not found")
}

func (lc *lobbyController) uniqueLobbyCode() (string, error) {
	code, err := generateRandomCode(4)
	if err != nil {
		return "", err
	}
	if _, ok := lc.lobbies[code]; ok {
		return lc. uniqueLobbyCode()
	}

	return code, nil
}

func generateRandomCode(length int) (string, error) {
	const charset = "ABCDEFGHIJKlNPQRSTUVWXYZ"
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i := 0; i < length; i++ {
		b[i] = charset[b[i]%byte(len(charset))]
	}
	return string(b), nil
}
