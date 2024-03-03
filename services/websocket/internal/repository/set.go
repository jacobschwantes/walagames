package repository

import (
	"database/sql"
	"log"
	"github.com/jacobschwantes/quizblitz/services/websocket/internal/models"
)

type setRepository struct {
	db *sql.DB
}

func newSetRepository(db *sql.DB) models.SetRepository {
	return &setRepository{
		db,
	}
}

func (setRepo *setRepository) GetSetByID(id int) (*models.Set, error) {
	var set models.Set
	query := `SELECT id, name FROM "Set" WHERE "id" = $1`
	row := setRepo.db.QueryRow(query, id)
	err := row.Scan(&set.ID, &set.Name)

	if err != nil {
		log.Fatal("set lookup failed", err)
		return nil, err
	}

	return &set, nil
}

