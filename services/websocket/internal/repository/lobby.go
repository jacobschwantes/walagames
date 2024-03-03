package repository

import (
	"fmt"

	"github.com/jacobschwantes/quizblitz/services/websocket/internal/models"
	"github.com/jacobschwantes/quizblitz/services/websocket/internal/util"

	"log"
)

type lobbyRepository struct {
	lobbies map[string]*models.Lobby
}

func NewLobbyRepository() models.LobbyRepository {
	return &lobbyRepository{
		lobbies: make(map[string]*models.Lobby),
	}
}

func (repo *lobbyRepository) CreateLobby() (*models.Lobby, error) {
	code, err := util.GenerateToken(4)

	// TODO: Check if the lobby code already exists

	if err != nil {
		log.Println(err)
		return nil, err
	}

	fmt.Println("Creating new lobby with code:", code)
	lobby := models.NewLobby(code)
	repo.lobbies[code] = lobby
	go lobby.Run(repo)
	return lobby, nil
}

func (repo *lobbyRepository) GetLobbyByCode(code string) (*models.Lobby, error) {
	if lobby, ok := repo.lobbies[code]; ok {
		return lobby, nil
	}

	return nil, fmt.Errorf("lobby not found")
}

func (repo *lobbyRepository) CloseLobby(code string, message string) error {
	if lobby, err := repo.GetLobbyByCode(code); err != nil {
		for c := range lobby.Clients {
			c.Close <- true
		}
		lobby.Game.Control <- "END_GAME"
		delete(repo.lobbies, code)
		return nil
	}

	return fmt.Errorf("lobby not found")
}
