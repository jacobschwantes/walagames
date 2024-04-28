package http

import (
	"encoding/json"
	"fmt"
	"net/http"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/game"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/lobby"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/websocket"
)

func host(api realtime.APIClient, lm realtime.LobbyManager, atm realtime.AuthTokenManager) http.HandlerFunc {
	type hostLobbyRequest struct {
		User *realtime.PlayerProfile `json:"user"`
		// LobbySettings *realtime.LobbySettings `json:"lobbySettings"`
		// GameSettings  *realtime.GameSettings  `json:"gameSettings"`
		QuizID string `json:"quizID"`
	}

	type hostLobbyReponse struct {
		Code  string `json:"code"`
		Token string `json:"token"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}

		var req *hostLobbyRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Failed to decode request body", http.StatusBadRequest)
			return
		}

		quiz, err := api.FetchQuiz(req.QuizID, req.User.ID)
		if err != nil {
			// TODO: need potentially more descriptive error handling (unauthorized, doesnt exist, etc)
			fmt.Println("Failed to fetch quiz:", err)
			http.Error(w, "Failed to fetch quiz", http.StatusInternalServerError)
			return
		}
		
		g := game.QuizBlitz(quiz)

		l, code, err := lm.CreateLobby(g)
		if err != nil {
			fmt.Println("failed to create lobby: ", err)
			http.Error(w, "Failed to create lobby", http.StatusInternalServerError)
			return
		}
		go l.Run(lm)

		player := lobby.NewPlayer(*req.User, realtime.RoleHost)
		err = l.Register(player)
		if err != nil {
			fmt.Println("failed to register host: ", err)
			http.Error(w, "Failed to register player", http.StatusInternalServerError)
			return
		}

		token, err := atm.GenerateToken(req.User.ID, code)
		if err != nil {
			fmt.Println("failed to generate auth token")
			http.Error(w, "Failed to geenrate auth token", http.StatusInternalServerError)
			return
		}

		resp := &hostLobbyReponse{
			Code:  code,
			Token: token,
		}
		jsonData, err := json.Marshal(resp)
		if err != nil {
			fmt.Println("failed to marshal response")
			http.Error(w, "Failed to marshal response", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(jsonData)
	}
}

func join(lm realtime.LobbyManager, auth realtime.AuthTokenManager) http.HandlerFunc {
	type joinLobbyRequest struct {
		User *realtime.PlayerProfile `json:"user"`
	}
	type joinLobbyReponse struct {
		Token string `json:"token"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// grab lobby code
		code := r.PathValue("code")
		if code == "" {
			http.Error(w, "Lobby code is required", http.StatusBadRequest)
			return
		}

		// lookup lobby
		l, err := lm.Lobby(code)
		if err != nil {
			http.Error(w, "Lobby does not exist", http.StatusNotFound)
			return
		}

		// get user info from req body
		var req *joinLobbyRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Failed to decode request body", http.StatusBadRequest)
			return
		}

		var player realtime.Player

		// player is not registered or is not allowed to join
		if player, err = l.Player(req.User.ID); player == nil {
			// player not allowed entry (lobby is full, player was kicked, etc)
			if err != nil {
				fmt.Println("player cant join because: ", err)
				http.Error(w, fmt.Sprintf("Unable to join: %v", err), http.StatusInternalServerError)
				return
			}

			// register player to lobby
			player = lobby.NewPlayer(*req.User, realtime.RolePlayer)
			err := l.Register(player) // player can now connect to lobby
			if err != nil {
				fmt.Println("failed to register player")
				http.Error(w, "failed to register player", http.StatusInternalServerError)
				return
			}
		}

		token, err := auth.GenerateToken(req.User.ID, code) // player uses this to join lobby (indentification)
		if err != nil {
			fmt.Println("failed to generate auth token")
			http.Error(w, "Failed to generate auth token", http.StatusInternalServerError)
			return
		}

		resp := &joinLobbyReponse{
			Token: token,
		}

		jsonData, err := json.Marshal(resp)
		if err != nil {
			fmt.Println("failed to marshal response")
			http.Error(w, "Failed to marshal response", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write(jsonData)
	}
}
func connect(lm realtime.LobbyManager, auth realtime.AuthTokenManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// grab auth token
		token := r.URL.Query().Get("token")
		if token == "" {
			http.Error(w, "Token required", http.StatusBadRequest)
			return
		}

		// consume auth token
		userID, lobbyCode, err := auth.ValidateToken(token)
		if err != nil {
			http.Error(w, "Token validation failed", http.StatusInternalServerError)
			return
		}

		// lookup lobby
		lobby, err := lm.Lobby(lobbyCode)
		if err != nil {
			http.Error(w, "Lobby lookup failed", http.StatusInternalServerError)
			return
		}

		// lookup player
		player, err := lobby.Player(userID)
		if err != nil {
			// likely was kicked
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		// upgrade client connection to websocket
		conn, err := websocket.UpgradeConnection(w, r)
		if err != nil {
			http.Error(w, "Failed to upgrade to websocket connection", http.StatusInternalServerError)
			return
		}

		// connect client to lobby
		lobby.Connect(conn, player)
	}
}
