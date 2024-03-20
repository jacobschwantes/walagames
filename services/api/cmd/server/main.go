package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/joho/godotenv"

	"github.com/jacobschwantes/quizblitz/services/api/internal"
	"github.com/jacobschwantes/quizblitz/services/api/internal/auth"
	"github.com/jacobschwantes/quizblitz/services/api/internal/http"
	"github.com/jacobschwantes/quizblitz/services/api/internal/lobby"
	"github.com/jacobschwantes/quizblitz/services/api/internal/mongo"
	"github.com/jacobschwantes/quizblitz/services/api/internal/postgres"
	"github.com/jacobschwantes/quizblitz/services/api/internal/redis"
	"github.com/jacobschwantes/quizblitz/services/api/internal/set"
	"github.com/jacobschwantes/quizblitz/services/api/internal/user"
)

func run(ctx context.Context) error {
	srvConfig := api.HTTPConfig{
		Host: "localhost",
		Port: "8081",
	}

	err := godotenv.Load()
	if err != nil {
		return err
	}

	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	pdb := postgres.NewClient("host=localhost port=5432 user=postgres password=mysecretpassword dbname=main sslmode=disable")
	defer pdb.Close()
	rdb := redis.NewClient(ctx, "redis://localhost:6379/0")
	defer rdb.Close()
	mdb := mongo.NewClient("mongodb://localhost:27017")
	defer func() {
		if err := mdb.Disconnect(ctx); err != nil {
			log.Fatal("Failed to disconnect from MongoDB: ", err)
			panic(err)
		}
	}()

	userRepo := postgres.NewUserRepository(pdb)
	authRepo := redis.NewAuthRepository(rdb)
	lobbyRepo := redis.NewLobbyRepository(rdb)
	setRepo := mongo.NewSetRepository(mdb)

	userService := user.NewService(userRepo)
	authService := auth.NewService(authRepo)
	lobbyService := lobby.NewService(lobbyRepo)
	setService := set.NewService(setRepo)

	http.ServeHTTP(ctx, srvConfig, authService, userService, lobbyService, setService)

	// ! idk
	return nil
}

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
