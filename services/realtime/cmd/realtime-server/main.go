package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/apiclient"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/http"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/lobby"
	"github.com/joho/godotenv"
)

func run(ctx context.Context) error {
	err := godotenv.Load()
	if err != nil {
		return err
	}

	srvConfig := realtime.HTTPConfig{
		Host: os.Getenv("HOST"),
		Port: os.Getenv("PORT"),
	}

	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	apiClient := apiclient.New(os.Getenv("API_URL"))
	lobbyManager := lobby.NewManager(apiClient)

	http.ServeHTTP(ctx, srvConfig, lobbyManager, apiClient)
	return nil
}

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "error running realtime server: %s\n", err)
		os.Exit(1)
	}
}
