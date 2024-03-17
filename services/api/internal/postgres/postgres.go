package postgres

import (
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
	"log"
)

func NewClient(connStr string) *sql.DB {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("PostgresConnectionError: ", err)
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("PostgresPingError: ", err)
		panic(err)
	}

	fmt.Println("Successfully connected to Postgres database")
	return db
}
