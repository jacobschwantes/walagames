package http

import (
	"crypto/rand"
	"encoding/json"
	"log"
	"net/http"
	"strings"
)

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
				log.Fatal(err)
				http.Error(w, "Failed to get user info.", http.StatusInternalServerError)
				return
			}

			token, err := rtr.authService.CreateTemporaryAuthToken(r.Context(), user.ID)
			if err != nil {
				log.Fatal(err)
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

func (rtr *Router) tokenValidateHandler(w http.ResponseWriter, r *http.Request) {

	if token := r.URL.Query().Get("token"); token != "" {
		userID, err := rtr.authService.ConsumeTemporaryAuthToken(r.Context(), token)
		if err != nil {
			// TODO: handle token validation failure
			log.Fatal(err)
			http.Error(w, "Failed to validate token.", http.StatusInternalServerError)
			return
		}

		user, err := rtr.userService.User(userID)
		if err != nil {
			// todo: handle user not found

			log.Fatal(err)
			http.Error(w, "User not found.", http.StatusNotFound)
			return
		}

		msg, err := json.Marshal(user)
		if err != nil {
			log.Fatal(err)
			http.Error(w, "Internal server error.", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write(msg)
		return
	}
	log.Fatal("Token is required.")
	http.Error(w, "Token is required.", http.StatusBadRequest)
}
func generateLobbyCode(length int) (string, error) {
	const charset = "ABCDEFGHIJKLMNPQRSTUVWXYZ"
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i := 0; i < length; i++ {
		b[i] = charset[b[i]%byte(len(charset))]
	}
	return string(b), nil
}

func (rtr *Router) lobbyCodeHandler(w http.ResponseWriter, r *http.Request) {
	code, err := generateLobbyCode(4)
	if err != nil {
		http.Error(w, "Failed to generate lobby code.", http.StatusInternalServerError)
		return
	}

	msg, err := json.Marshal(code)
	if err != nil {
		log.Fatal(err)
		http.Error(w, "Failed to generate lobby code.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(msg)
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
