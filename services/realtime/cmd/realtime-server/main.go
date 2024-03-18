package main

import (
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/apiclient"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/http"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/lobby"
)

func main() {

	apiClient := apiclient.New("http://localhost:8081/internal")
	lobbyManager := lobby.NewManager(apiClient)

	router := http.NewRouter(lobbyManager, apiClient)
	router.ServeHTTP()
}
