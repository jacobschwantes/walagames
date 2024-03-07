package http

import (
	"context"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
	"github.com/jacobschwantes/quizblitz/services/realtime/internal/websocket"
	"net/http"
	"strings"
)

func newAuthenticatedPlayer(ctx context.Context, us realtime.UserRepository, as realtime.AuthService, token string, role realtime.PlayerRole) (*realtime.Player, error) {
	userID, err := as.ConsumeTemporaryAuthToken(ctx, token)
	if err != nil {
		return nil, err
	}
	user, err := us.User(userID)
	if err != nil {
		return nil, err
	}
	return realtime.NewPlayer(*user.Name, *user.Image, role, true), nil
}

func hostHandler(lm realtime.LobbyManager, us realtime.UserService, as realtime.AuthService, w http.ResponseWriter, r *http.Request) {
	if token := r.URL.Query().Get("token"); token != "" {
		player, err := newAuthenticatedPlayer(r.Context(), us, as, token, realtime.RoleHost)
		if err != nil {
			http.Error(w, "Failed to get user info.", http.StatusInternalServerError)
			return
		}
		
		lobby, err := lm.CreateLobby()
		if err != nil {
			http.Error(w, "Failed to create lobby.", http.StatusInternalServerError)
			return
		}

		conn, err := websocket.UpgradeConnection(w, r)
		if err != nil {
			lm.CloseLobby(lobby.Code, "Failed to upgrade to websocket connection.")
			http.Error(w, "Failed to upgrade to websocket connection.", http.StatusInternalServerError)
			return
		}

		c := realtime.NewClient(lobby, conn, player)
		c.Lobby.Register <- c
		go websocket.WritePump(c)
		go websocket.ReadPump(c)
	} else {
		http.Error(w, "Token is required.", http.StatusBadRequest)
		return
	}
}

func joinHandler(lm realtime.LobbyManager, us realtime.UserService, as realtime.AuthService, w http.ResponseWriter, r *http.Request) {
	var player *realtime.Player

	if lobbyCode := r.PathValue("lobbyCode"); lobbyCode != "" {
		lobby, err := lm.Lobby(lobbyCode)
		if err != nil {
			http.Error(w, "Lobby not found.", http.StatusNotFound)
			return
		}

		if token := r.URL.Query().Get("token"); token != "" {
			player, err = newAuthenticatedPlayer(r.Context(), us, as, token, realtime.RoleAuthenticatedPlayer)
			if err != nil {
				http.Error(w, "Failed to get user info.", http.StatusInternalServerError)
				return
			}
		} else {
			if username := r.URL.Query().Get("username"); username != "" {
				player = realtime.NewPlayer(username, "", realtime.RoleGuestPlayer, false)
			} else {
				http.Error(w, "Username is required.", http.StatusBadRequest)
				return
			}
		}

		conn, err := websocket.UpgradeConnection(w, r)
		if err != nil {
			http.Error(w, "Failed to upgrade to websocket connection.", http.StatusInternalServerError)
			return
		}

		c := realtime.NewClient(lobby, conn, player)
		c.Lobby.Register <- c
		go websocket.WritePump(c)
		go websocket.ReadPump(c)
	} else {
		http.Error(w, "Lobby code is required.", http.StatusBadRequest)
		return
	}
}

func authHandler(us realtime.UserService, as realtime.AuthService, w http.ResponseWriter, r *http.Request) {
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
			user, err := us.UserBySession(sessionToken)
			if err != nil {
				http.Error(w, "Failed to get user info.", http.StatusInternalServerError)
				return
			}

			token, err := as.CreateTemporaryAuthToken(r.Context(), user.ID)
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
