package http

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/game"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/websocket"
)

func host(api realtime.APIClient, lc realtime.LobbyController, auth realtime.AuthTokenManager) http.HandlerFunc {
	type hostLobbyRequest struct {
		User *realtime.UserInfo `json:"user"`
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

		// Parse request body
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

		lobby, err := lc.CreateLobby()
		if err != nil {
			fmt.Println("failed to create lobby: ", err)
			http.Error(w, "Failed to create lobby", http.StatusInternalServerError)
			return
		}
		go lobby.Run()

		game := game.QuizBlitz(lobby, quiz)
		lobby.SetGame(game)

		player := &realtime.Player{
			Status:   realtime.StatusJoining,
			ID:       req.User.ID,
			Role:     realtime.RoleHost,
			Image:    req.User.Image,
			Username: req.User.Username,
		}
		err = lobby.RegisterPlayer(player)
		if err != nil {
			fmt.Println("failed to register host: ", err)
			http.Error(w, "Failed to register player", http.StatusInternalServerError)
			return
		}

		token, err := auth.GenerateToken(req.User.ID, lobby.Code())
		if err != nil {
			fmt.Println("failed to generate auth token")
			http.Error(w, "Failed to geenrate auth token", http.StatusInternalServerError)
			return
		}

		resp := &hostLobbyReponse{
			Code:  lobby.Code(),
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

func join(lc realtime.LobbyController, auth realtime.AuthTokenManager) http.HandlerFunc {
	type joinLobbyRequest struct {
		User *realtime.UserInfo `json:"user"`
	}
	type joinLobbyReponse struct {
		Token string `json:"token"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		code := r.PathValue("code")
		if code == "" {
			http.Error(w, "Lobby code is required", http.StatusBadRequest)
			return
		}

		lobby, err := lc.Lobby(code)
		if err != nil {
			http.Error(w, "Lobby does not exist", http.StatusNotFound)
			return
		}

		var req *joinLobbyRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Failed to decode request body", http.StatusBadRequest)
			return
		}

		var player *realtime.Player

		// player is not already registered or is not allowed to join
		if player, err = lobby.Player(req.User.ID); player == nil {
			// lobby is full, player was kicked, etc
			if err != nil {
				fmt.Println("player cant join because: ", err)
				http.Error(w, fmt.Sprintf("Unable to join: %v", err), http.StatusInternalServerError)
				return
			}

			player = &realtime.Player{
				Status:   realtime.StatusJoining,
				ID:       req.User.ID,
				Role:     realtime.RoleHost,
				Image:    req.User.Image,
				Username: req.User.Username,
			}
			err := lobby.RegisterPlayer(player)
			if err != nil {
				fmt.Println("failed to register player")
				http.Error(w, "failed to register player", http.StatusInternalServerError)
				return
			}
		}

		token, err := auth.GenerateToken(req.User.ID, code)
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
func connect(lc realtime.LobbyController, auth realtime.AuthTokenManager) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		token := r.URL.Query().Get("token")
		if token == "" {
			fmt.Println("no token")
			http.Error(w, "Token required", http.StatusBadRequest)
			return
		}

		userID, lobbyCode, err := auth.ValidateToken(token)
		if err != nil {
			fmt.Println("token validation failed: ", err)
			http.Error(w, "Token validation failed", http.StatusInternalServerError)
			return
		}

		lobby, err := lc.Lobby(lobbyCode)
		if err != nil {
			fmt.Println("lobby lookup failed: ", err)
			http.Error(w, "Lobby lookup failed", http.StatusInternalServerError)
			return
		}

		conn, err := websocket.UpgradeConnection(w, r)
		if err != nil {
			fmt.Println("Failed to upgrade client to websocket connection")
			http.Error(w, "Failed to upgrade to websocket connection", http.StatusInternalServerError)
			return
		}

		client := websocket.NewClient(conn, userID, lobby)

		err = lobby.Connect(userID, client)
		if err != nil {
			fmt.Println("connection failed")
			http.Error(w, "Lobby connection failed", http.StatusInternalServerError)
			return
		}

		
	}
}
