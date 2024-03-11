package postgres

import (
	"database/sql"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"

	"log"
)

type setRepository struct {
	db *sql.DB
}

func NewSetRepository(db *sql.DB) realtime.SetRepository {
	return &setRepository{
		db,
	}
}

func (repo *setRepository) Set(id int) (*realtime.Set, error) {
	var set realtime.Set
	query := `SELECT id, owner_id, name, description, image_url FROM "Set" WHERE "id" = $1`
	row := repo.db.QueryRow(query, id)
	err := row.Scan(&set.ID, &set.OwnerID, &set.Name, &set.Description, &set.ImageURL)

	if err != nil {
		log.Fatal("set lookup failed", err)
		return nil, err
	}

	return &set, nil
}