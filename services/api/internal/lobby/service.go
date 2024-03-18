package lobby

import (
	"context"
	"crypto/rand"
	"fmt"

	"github.com/jacobschwantes/quizblitz/services/api/internal"
)

type lobbyService struct {
	repo api.LobbyRepository
}

func NewService(repo api.LobbyRepository) api.LobbyService {
	return &lobbyService{repo}
}

func (ls *lobbyService) GenerateUniqueLobbyCode(ctx context.Context) (string, error) {
	code, err := generateLobbyCode(4)
	if err != nil {
		return "", err
	}
	exists, err := ls.repo.LobbyExists(ctx, code)
	if err != nil {
		return "", err
	}
	if exists {
		return ls.GenerateUniqueLobbyCode(ctx)
	}
	return code, nil
}

func (ls *lobbyService) SaveLobbyState(ctx context.Context, code string, state api.LobbyMetadata) error {
	fmt.Println("Saving lobby state", code, state)
	return ls.repo.SaveLobbyMetadata(ctx, code, state)
}

func (ls *lobbyService) GetLobbyState(ctx context.Context, code string) (*api.LobbyMetadata, error) {
	return ls.repo.GetLobbyMetadata(ctx, code)
}

// func (ls *lobbyService) InitializeNewLobby(ctx context.Context) {

// }

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
