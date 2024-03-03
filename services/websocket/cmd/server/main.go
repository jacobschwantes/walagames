package main

import (
	"context"

	"github.com/jacobschwantes/quizblitz/services/websocket/internal/repository"
	"github.com/jacobschwantes/quizblitz/services/websocket/internal/routes"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"log"
	"net/http"
)

var ctx = context.Background()

func main() {
	db := repository.NewPostgresClient("host=localhost port=5432 user=postgres password=mysecretpassword dbname=postgres sslmode=disable")
	rdb := repository.NewRedisClient(ctx, &redis.Options{
		Addr:     "localhost:6379",
		Password: "", // no password set
		DB:       0,  // use default DB
	})
	defer db.Close()
	defer rdb.Close()

	userRepo := repository.NewUserRepository(db, rdb)
	lobbyRepo := repository.NewLobbyRepository()

	router := routes.NewRouter(userRepo, lobbyRepo)

	err := http.ListenAndServe(":8080", router)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
