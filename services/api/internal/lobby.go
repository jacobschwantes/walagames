package api

import (
	"context"
)

type LobbyRepository interface {
	LobbyExists(ctx context.Context, code string) (bool, error)
	SaveLobbyMetadata(ctx context.Context, code string, metadata LobbyMetadata) error
	UpdateLobbyMetadata(ctx context.Context, code string, updates map[string]interface{}) error
	GetLobbyMetadata(ctx context.Context, code string) (*LobbyMetadata, error)
	DeleteLobbyMetadata(ctx context.Context, code string) error
}

type LobbyService interface {
	GenerateUniqueLobbyCode(ctx context.Context) (string, error)
	SaveLobbyState(ctx context.Context, code string, state LobbyMetadata) error
	GetLobbyState(ctx context.Context, code string) (*LobbyMetadata, error)
}

type LobbyMetadata struct {
	Code        string
	PlayerCount int
	MaxPlayers  int
	HostServer  string
}
