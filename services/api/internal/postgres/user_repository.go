package postgres

import (
	"database/sql"

	"github.com/jacobschwantes/quizblitz/services/api/internal"

	"log"
)

type userRepository struct {
	db *sql.DB
}

// NewUserRepository creates a new UserRepository.
func NewUserRepository(db *sql.DB) api.UserRepository {
	return &userRepository{
		db,
	}
}

// GetUserByID retrieves a user by their ID from the database.
func (repo *userRepository) User(id string) (*api.User, error) {
	var user api.User
	query := `SELECT id, name, email, image  FROM "users" WHERE "id" = $1`
	row := repo.db.QueryRow(query, id)
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Image)

	if err != nil {
		log.Fatal("user lookup failed", err)
		return nil, err
	}

	return &user, nil
}

func (repo *userRepository) UserBySession(token string) (*api.User, error) {
	var userId string
	query := `SELECT "userId" FROM "sessions" WHERE "sessionToken" = $1`
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
