package main

import (
	"github.com/jacobschwantes/quizblitz/services/api/internal/http"
	"github.com/jacobschwantes/quizblitz/services/api/internal/postgres"
	"github.com/jacobschwantes/quizblitz/services/api/internal/redis"
	"github.com/jacobschwantes/quizblitz/services/api/internal/user"
	"github.com/jacobschwantes/quizblitz/services/api/internal/auth"
	"context"
)



func main() {
	db := postgres.NewClient("host=localhost port=5432 user=postgres password=mysecretpassword dbname=main sslmode=disable")
	defer db.Close()

	rdb := redis.NewClient(context.Background(), "redis://localhost:6379/0")
	defer rdb.Close()

	userRepo := postgres.NewUserRepository(db)
	// setRepo := postgres.NewSetRepository(db)
	authRepo := redis.NewAuthRepository(rdb)

	userService := user.NewService(userRepo)
	authService := auth.NewService(authRepo)
	// setSerice := set.NewService(setRepo)

	router := http.NewRouter(authService, userService)
	router.ServeHTTP()
}