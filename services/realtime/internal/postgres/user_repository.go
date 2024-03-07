package postgres

import (
	"database/sql"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"

	"log"
)

type userRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new UserRepository.
func NewUserRepository(db *sql.DB) realtime.UserRepository {
	return &userRepository{
		db,
	}
}

// GetUserByID retrieves a user by their ID from the database.
func (repo *userRepository) User(id string) (*realtime.User, error) {
	var user realtime.User
	query := `SELECT id, name, email, image  FROM "User" WHERE "id" = $1`
	row := repo.db.QueryRow(query, id)
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Image)

	if err != nil {
		log.Fatal("user lookup failed", err)
		return nil, err
	}

	return &user, nil
}

func (repo *userRepository) UserBySession(token string) (*realtime.User, error) {
	var userId string
	query := `SELECT "userId" FROM "Session" WHERE "sessionToken" = $1`
	row := repo.db.QueryRow(query, token)
	err := row.Scan(&userId)
	if err != nil {
		log.Fatal("session lookup failed", err)
		return nil, err
	}

	user, err := repo.User(userId)
	if err != nil {
		return nil, err
	}

	return user, nil
}
