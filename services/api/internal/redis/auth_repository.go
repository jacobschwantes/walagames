package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/jacobschwantes/quizblitz/services/api/internal"
	"github.com/redis/go-redis/v9"
)

// TODO: Move this to a config file or environment variable
const (
	OTC_TTL = 1 * time.Minute
)

type authRepository struct {
	rdb *redis.Client
}

func NewAuthRepository(rdb *redis.Client) api.AuthRepository {
	return &authRepository{
		rdb,
	}
}

func newAuthKey(token string) string {
	return fmt.Sprintf("tat:%s", token)
}

func (ar *authRepository) RetrieveTemporaryAuthToken(ctx context.Context, token string) (string, error) {
	return ar.rdb.Get(ctx, newAuthKey(token)).Result()
}

func (ar *authRepository) InsertTemporaryAuthToken(ctx context.Context, token string, userID string) error {
	return ar.rdb.Set(ctx, newAuthKey(token), userID, OTC_TTL).Err()
}

func (ar *authRepository) EvictTemporaryAuthToken(ctx context.Context, token string) error {
	return ar.rdb.Del(ctx, newAuthKey(token)).Err()
}