package redis

import (
	"context"
	"errors"
	"fmt"
	"strconv"

	"github.com/jacobschwantes/quizblitz/services/api/internal"
	"github.com/redis/go-redis/v9"
)

type lobbyRepository struct {
	rdb *redis.Client
}

func NewLobbyRepository(rdb *redis.Client) api.LobbyRepository {
	return &lobbyRepository{
		rdb,
	}
}

func (lr *lobbyRepository) LobbyExists(ctx context.Context, code string) (bool, error) {
	exists, err := lr.rdb.Exists(ctx, code).Result()
	if err != nil {
		return false, err
	}
	if exists > 0 {
		return true, nil
	}
	return false, nil
}

// TODO: fix return format
// SaveLobbyMetadata saves the metadata for a lobby in Redis.
func (lr *lobbyRepository) SaveLobbyMetadata(ctx context.Context, code string, metadata api.LobbyMetadata) error {
	// Convert metadata to a format suitable for Redis (e.g., a flat key-value map)
	redisMetadata := map[string]interface{}{
		"player_count": metadata.PlayerCount,
		"max_players":  metadata.MaxPlayers,
		"host_server":  metadata.HostServer,
	}

	// Save the metadata in Redis
	if _, err := lr.rdb.HMSet(ctx, code, redisMetadata).Result(); err != nil {
		return err
	}

	return nil
}

// UpdateLobbyMetadata updates the metadata for a lobby in Redis.
func (lr *lobbyRepository) UpdateLobbyMetadata(ctx context.Context, code string, updates map[string]interface{}) error {
	// Check if the lobby exists
	exists, err := lr.rdb.Exists(ctx, code).Result()
	if err != nil {
		return err
	}

	if exists == 0 {
		return errors.New("lobby not found")
	}

	// Update the metadata
	if _, err := lr.rdb.HMSet(ctx, code, updates).Result(); err != nil {
		return err
	}

	return nil
}

// DeleteLobbyMetadata deletes the metadata for a lobby from Redis.
func (lr *lobbyRepository) DeleteLobbyMetadata(ctx context.Context, code string) error {
	if _, err := lr.rdb.Del(ctx, code).Result(); err != nil {
		return err
	}

	return nil
}

// TODO: fix return format
func (lr *lobbyRepository) GetLobbyMetadata(ctx context.Context, code string) (*api.LobbyMetadata, error) {
	metadata, err := lr.rdb.HGetAll(ctx, code).Result()
	if err != nil {
		return nil, err
	}

	if len(metadata) == 0 {
		return nil, errors.New("lobby does not exist")
	}

	// ! This is a bug. The maxPlayers should be an int, not a string.
	// Convert Redis metadata to a more usable format
	playerCount, err := strconv.Atoi(metadata["player_count"])
	if err != nil {
		return nil, err
	}
	maxPlayers, err := strconv.Atoi(metadata["max_players"])
	if err != nil {
		return nil, err
	}
	fmt.Println("meta data: ", metadata)

	lobbyMetadata := &api.LobbyMetadata{
		PlayerCount: playerCount,
		MaxPlayers:  maxPlayers,
		HostServer:  metadata["host_server"],
	}

	return lobbyMetadata, nil
}
