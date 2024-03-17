package main

import (
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/apiclient"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/http"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/lobby"
)

func main() {
	// db := postgres.NewClient("host=localhost port=5432 user=postgres password=mysecretpassword dbname=main sslmode=disable")
	// defer db.Close()

	// rdb := redis.NewClient(context.Background(), "redis://localhost:6379/0")
	// defer rdb.Close()

	// userRepo := postgres.NewUserRepository(db)
	// setRepo := postgres.NewSetRepository(db)
	// authRepo := redis.NewAuthRepository(rdb)

	// userService := user.NewService(userRepo)
	// authService := auth.NewService(authRepo)
	lobbyManager := lobby.NewManager()
	apiClient := apiclient.New("http://localhost:8081")

	router := http.NewRouter(lobbyManager, apiClient)
	router.ServeHTTP()
}
