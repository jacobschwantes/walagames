package postgres

import (
	"database/sql"

	"github.com/jacobschwantes/quizblitz/services/api/internal"

	"log"
)

type setRepository struct {
	db *sql.DB
}

func NewSetRepository(db *sql.DB) api.SetRepository {
	return &setRepository{
		db,
	}
}

func (repo *setRepository) Set(id int) (*api.Set, error) {
	var set api.Set
	query := `SELECT id, owner_id, name, description, image_url FROM "set" WHERE "id" = $1`
	row := repo.db.QueryRow(query, id)
	err := row.Scan(&set.ID, &set.OwnerID, &set.Name, &set.Description, &set.ImageURL)

	if err != nil {
		log.Fatal("set lookup failed", err)
		return nil, err
	}

	return &set, nil
}