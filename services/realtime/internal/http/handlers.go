package http

import (
	"log"
	"net/http"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/websocket"
)

func (rtr *Router) lobbyHandler(w http.ResponseWriter, r *http.Request) {
	var client *realtime.Client
	var lobby *realtime.Lobby
	var err error
	player := r.Context().Value(userContextKey).(*realtime.Player)
	lobbyCode := r.URL.Query().Get("code")

	if lobbyCode != "" {
		lobby, err = rtr.lobbyService.Lobby(lobbyCode)
		if err != nil {
			http.Error(w, "Lobby not found.", http.StatusNotFound)
			return
		}
	} else {
		if player.Authenticated {
			lobbyCode, err := rtr.apiClient.GetLobbyCode()
			if err != nil {
				log.Fatal("Failed to get lobby code.")
				http.Error(w, "Failed to get lobby code.", http.StatusInternalServerError)
				return
			}
			lobby, err = rtr.lobbyService.CreateLobby(lobbyCode)
			if err != nil {
				http.Error(w, "Failed to create lobby.", http.StatusInternalServerError)
				return
			}
			player.Role = realtime.RoleHost
		} else {
			http.Error(w, "You must have an account to create a lobby.", http.StatusBadRequest)
			return
		}
	}
	conn, err := websocket.UpgradeConnection(w, r)
	if err != nil {
		http.Error(w, "Failed to upgrade to websocket connection.", http.StatusInternalServerError)
		return
	}

	client = realtime.NewClient(lobby, conn, player)
	client.Lobby.Register <- client
	go websocket.WritePump(client)
	go websocket.ReadPump(client)
}

