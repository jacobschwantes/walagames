package lobby

import (
	"fmt"

	
	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type lobbyRepository struct {
	lobbies map[string]*realtime.Lobby
}

func newLobbyRepository() realtime.LobbyRepository {
	return &lobbyRepository{
		lobbies: make(map[string]*realtime.Lobby),
	}
}

func (lr *lobbyRepository) Lobby(code string) (*realtime.Lobby, error) {
	if lobby, ok := lr.lobbies[code]; ok {
		return lobby, nil
	}
	return nil, fmt.Errorf("lobby not found")
}

func (lr *lobbyRepository) InsertLobby(lobby *realtime.Lobby) error {
	lr.lobbies[lobby.Code] = lobby
	return nil
}

func (lr *lobbyRepository) UpdateLobby(code string, lobby *realtime.Lobby) error {
	lr.lobbies[code] = lobby
	return nil
}

func (lr *lobbyRepository) DeleteLobby(code string) error {
	delete(lr.lobbies, code)
	return nil
}

func (lr *lobbyRepository) Lobbies() ([]*realtime.Lobby) {
	var lobbies []*realtime.Lobby
	for _, lobby := range lr.lobbies {
		lobbies = append(lobbies, lobby)
	}
	return lobbies
}
