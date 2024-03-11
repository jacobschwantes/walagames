package http

import (
	"net/http"
	"strings"

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
			lobby, err = rtr.lobbyService.CreateLobby()
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

func (rtr *Router) authHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

	switch r.Method {
	case http.MethodOptions:
		w.WriteHeader(http.StatusOK)
	case http.MethodPost:
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			sessionToken := authHeader[len("Bearer "):]
			user, err := rtr.userService.UserBySession(sessionToken)
			if err != nil {
				http.Error(w, "Failed to get user info.", http.StatusInternalServerError)
				return
			}

			token, err := rtr.authService.CreateTemporaryAuthToken(r.Context(), user.ID)
			if err != nil {
				http.Error(w, "Failed to generate temporary authentication token.", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Write([]byte(token))
		} else {
			http.Error(w, "Authorization header is required and must start with 'Bearer '.", http.StatusBadRequest)
		}
	default:
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
	}
}

// func (rtr *Router) lobbyExistsHandler(w http.ResponseWriter, r *http.Request) {
// 	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
// 	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
// 	lobbyCode := r.URL.Query().Get("code")
// 	if lobbyCode == "" {
// 		fmt.Println("Lobby code is required.")
// 		http.Error(w, "Lobby code is required.", http.StatusBadRequest)
// 		return
// 	}

// 	_, err := rtr.lobbyService.Lobby(lobbyCode)
// 	if err != nil {
// 		fmt.Println("Lobby not found.")
// 		http.Error(w, "Lobby not found.", http.StatusNotFound)
// 		return
// 	}

// 	w.WriteHeader(http.StatusOK)
// }
