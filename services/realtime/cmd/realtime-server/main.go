package main

import (
	"fmt"
	"os"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal/apiclient"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/http"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/lobby"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Error loading .env file")
		panic(err)
	}
	apiClient := apiclient.New(fmt.Sprintf("%s/%s", os.Getenv("API_ORIGIN"), "internal"))
	lobbyManager := lobby.NewManager(apiClient)

	router := http.NewRouter(lobbyManager, apiClient)
	router.ServeHTTP()
}
