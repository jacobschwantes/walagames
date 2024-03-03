package repository

import (
	"database/sql"
	"log"
	"fmt"
	"context"

	"github.com/jacobschwantes/quizblitz/services/websocket/internal/models"
	"github.com/jacobschwantes/quizblitz/services/websocket/internal/util"
	"github.com/redis/go-redis/v9"
	"time"

)


const (
	OTC_TTL = 1 * time.Minute
)

type userRepository struct {
	db *sql.DB
	rdb *redis.Client
}

// NewUserRepository creates a new UserRepository.
func NewUserRepository(db *sql.DB, rdb *redis.Client) models.UserRepository {
	return &userRepository{
		db,
		rdb,
	}
}

// GetUserByID retrieves a user by their ID from the database.
func (repo *userRepository) GetUserById(id string) (*models.User, error) {
	var user models.User
	query := `SELECT id, name, email, image  FROM "User" WHERE "id" = $1`
	row := repo.db.QueryRow(query, id)
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Image)

	if err != nil {
		log.Fatal("user lookup failed", err)
		return nil, err
	}


	return &user, nil
}

func (repo *userRepository) GetUserBySessionToken(token string) (*models.User, error) {
	var userId string
	query := `SELECT "userId" FROM "Session" WHERE "sessionToken" = $1`
	row := repo.db.QueryRow(query, token)
	err := row.Scan(&userId)

	if err != nil {
		log.Fatal("session lookup failed", err)
		return nil, err
	}

	user, err := repo.GetUserById(userId)

	if err != nil {
		return nil, err
	}

	return user, nil

}

func (repo *userRepository) CreateTemporaryAuthToken(ctx context.Context, id string) (string, error) {
	token, err := util.GenerateToken(8)
	if err != nil {
		log.Fatal(err)
		return "", err
	}
	key := fmt.Sprintf("ott:%s", token)
	err = repo.rdb.Set(ctx, key, id, OTC_TTL).Err()
	return token, err
}

func (repo *userRepository) ConsumeTemporaryAuthToken(ctx context.Context, token string) (string, error) {
	// TODO: evict the OTC from Redis after it's used
	key := fmt.Sprintf("ott:%s", token)
	userID, err := repo.rdb.Get(ctx, key).Result()
	if err != nil {
		panic(err)
	}

	return userID, nil
}