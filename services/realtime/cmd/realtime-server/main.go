package main

import (
	"context"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal/auth"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/http"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/lobby"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/postgres"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/redis"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/user"
)

func main() {
	db := postgres.NewClient("host=localhost port=5432 user=postgres password=mysecretpassword dbname=postgres sslmode=disable")
	defer db.Close()

	rdb := redis.NewClient(context.Background(), "redis://localhost:6379/0")
	defer rdb.Close()

	userRepo := postgres.NewUserRepository(db)
	setRepo := postgres.NewSetRepository(db)
	authRepo := redis.NewAuthRepository(rdb)

	userService := user.NewService(userRepo)
	authService := auth.NewService(authRepo)
	lobbyManager := lobby.NewManager()

	router := http.NewRouter(lobbyManager, userService, authService, setRepo)
	router.ServeHTTP()
}
