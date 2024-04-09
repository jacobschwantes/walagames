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
	"github.com/jacobschwantes/quizblitz/services/api/internal/quiz"
	"github.com/jacobschwantes/quizblitz/services/api/internal/user"
)

func run(ctx context.Context) error {
	err := godotenv.Load()
	if err != nil {
		return err
	}

	srvConfig := api.HTTPConfig{
		Host: os.Getenv("HOST"),
		Port: os.Getenv("PORT"),
	}

	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	pdb := postgres.NewClient(os.Getenv("POSTGRES_URI"))
	defer pdb.Close()
	rdb := redis.NewClient(ctx, os.Getenv("REDIS_URI"))
	defer rdb.Close()
	mdb := mongo.NewClient(os.Getenv("MONGO_URI"))
	defer func() {
		if err := mdb.Disconnect(ctx); err != nil {
			log.Fatal("Failed to disconnect from MongoDB: ", err)
			panic(err)
		}
	}()

	userService := user.NewService(postgres.NewUserRepository(pdb))
	authService := auth.NewService(redis.NewAuthRepository(rdb))
	lobbyService := lobby.NewService(redis.NewLobbyRepository(rdb))
	setService := quiz.NewService(mongo.NewSetRepository(mdb))

	http.ServeHTTP(ctx, srvConfig, authService, userService, lobbyService, setService)

	return nil
}

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
