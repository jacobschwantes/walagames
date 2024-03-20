package main

import (
	"context"
	"fmt"
	"os"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/apiclient"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/http"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/lobby"
	"github.com/joho/godotenv"
)

func run(ctx context.Context) error {
	srvConfig := realtime.HTTPConfig{
		Host: "localhost",
		Port: "8080",
	}

	err := godotenv.Load()
	if err != nil {
		return err
	}

	apiClient := apiclient.New(fmt.Sprintf("%s/%s", os.Getenv("API_ORIGIN"), "internal"))
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
