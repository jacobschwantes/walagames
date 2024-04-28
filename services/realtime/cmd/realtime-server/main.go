package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"time"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/api"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/auth"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/http"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/lobby"
	"github.com/joho/godotenv"
)

func run(ctx context.Context) error {
	err := godotenv.Load()
	if err != nil {
		return err
	}
	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	cfg := &realtime.HTTPConfig{
		Host:        os.Getenv("HOST"),
		Port:        os.Getenv("PORT"),
		APIEndpoint: os.Getenv("API_ENDPOINT"),
		APIKey:      os.Getenv("API_KEY"),
		// AllowedOrigin: os.Getenv("CORS_ALLOWED_ORIGINS"),
	}
	api := api.NewClient(cfg.APIEndpoint, cfg.APIKey)
	lm := lobby.NewManager(api)
	atm := auth.NewTokenManager(30 * time.Second) // tokens expire after 30 seconds

	http.ServeHTTP(ctx, cfg, lm, api, atm)
	return nil
}

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "error running realtime server: %s\n", err)
		os.Exit(1)
	}
}
