package routes

import (
	"fmt"
	"log"
	"net/http"

	"github.com/jacobschwantes/quizblitz/services/websocket/internal/models"
	"github.com/jacobschwantes/quizblitz/services/websocket/internal/services"
)



func NewRouter(userRepo models.UserRepository, lobbyRepo models.LobbyRepository) *http.ServeMux {
	mux := http.NewServeMux()

	// TODO: rate limiting middleware

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	mux.HandleFunc("/auth", func(w http.ResponseWriter, r *http.Request) {
		authHandler(userRepo, w, r)
	})

	mux.HandleFunc("/websocket", func(w http.ResponseWriter, r *http.Request) {
		webSocketHandler(lobbyRepo, userRepo, w, r)
	})

	return mux
}

func webSocketHandler(lobbyRepo models.LobbyRepository, userRepo models.UserRepository, w http.ResponseWriter, r *http.Request) {
	// TODO: create a private function to handle creating the player including checking for a token, etc
	code := r.URL.Query().Get("lobby")
	username := r.URL.Query().Get("username")
	token := r.URL.Query().Get("token")

	var u *models.Player

	if token != "" {
		// an authenticated user is trying to setup a connection
		userID, err := userRepo.ConsumeTemporaryAuthToken(r.Context(), token)

		if err != nil {
			// token is invalid or expired
			fmt.Println(err)
			http.Error(w, "Invalid Token", http.StatusBadRequest)
			return
		}
		user, err := userRepo.GetUserById(userID)
		if err != nil {
			log.Println(err)
			return
		}

		if code != "" {
			// an authenticated user is trying to join a lobby
			fmt.Println("Authenticated user is trying to join a lobby")
			u = models.NewPlayer(*user.Name, *user.Image, models.RoleAuthenticatedPlayer, true)

		} else {
			// an authenticated user is trying to create a lobby
			fmt.Println("Authenticated user is trying to create a lobby")
			u = models.NewPlayer(*user.Name, *user.Image, models.RoleHost, true)
		}

	} else {
		// a guest user is trying to join a lobby
		if code == "" {
			http.Error(w, "Lobby code required", http.StatusBadRequest)
			return
		}
		if username == "" {
			http.Error(w, "Username is required.", http.StatusBadRequest)
			return
		}

		u = models.NewPlayer(username, "", models.RoleGuestPlayer, false)
	}

	conn, err := services.UpgradeToWebSocketConnection(w, r)
	if err != nil {
		log.Println(err)
		return
	}

	var lobby *models.Lobby

	if u.Role == models.RoleHost {
		lobby, err = lobbyRepo.CreateLobby()
		if err != nil {
			log.Println(err)
			return
		}
	} else {
		lobby, err = lobbyRepo.GetLobbyByCode(code)
		if err != nil {
			log.Println(err)
			return
		}
	}

	client := &models.Client{
		Lobby: lobby,
		Conn:  conn,
		Send:  make(chan []byte, 256),
		Close: make(chan bool),
		User:  u,
	}

	fmt.Println(fmt.Sprintf("%s has joined the lobby with role %s", client.User.Username, client.User.Role))
	fmt.Println("Lobby code is", lobby.Code)

	client.Lobby.Register <- client

	go client.WritePump()
	go client.ReadPump()

}

func authHandler(userRepo models.UserRepository, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000") // Allow localhost:3000 to make requests to this server
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

	switch r.Method {
	case "OPTIONS":
		w.WriteHeader(http.StatusOK)
		return
	case "POST":
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			http.Error(w, "Authorization header is required.", http.StatusBadRequest)
			return
		}

		sessionToken := authHeader[len("Bearer "):]

		user, err := userRepo.GetUserBySessionToken(sessionToken)

		if err != nil {
			http.Error(w, "Failed to get user info.", http.StatusInternalServerError)
			return
		}

		token, err := userRepo.CreateTemporaryAuthToken(r.Context(), user.ID)

		if err != nil {
			http.Error(w, "Failed to generate temporary authentication token.", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte(token))
		return
	default:
		http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		return
	}

}
