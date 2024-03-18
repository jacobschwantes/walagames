package http

import (
	"encoding/json"
	"log"
	"net/http"

	api "github.com/jacobschwantes/quizblitz/services/api/internal"
)

func authHandler(authService api.AuthService, userService api.UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

		switch r.Method {
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		case http.MethodPost:
			authToken := r.Context().Value(authTokenContextKey).(string)
			user, err := userService.UserBySession(authToken)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to get user info.", http.StatusInternalServerError)
				return
			}

			token, err := authService.CreateTemporaryAuthToken(r.Context(), user.ID)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to generate temporary authentication token.", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(token))

		default:
			http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		}
	}
}

// todo: refactor this
func lobbyJoinHandler(lobbyService api.LobbyService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")

		switch r.Method {
		case http.MethodOptions:
			w.WriteHeader(http.StatusOK)
		case http.MethodPost:
			var joinRequest api.LobbyJoinRequest
			if err := json.NewDecoder(r.Body).Decode(&joinRequest); err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to decode join request.", http.StatusBadRequest)
				return
			}

			lobbyData, err := lobbyService.GetLobbyState(r.Context(), joinRequest.Code)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to get lobby data.", http.StatusInternalServerError)
				return
			}

			jsonData, err := json.Marshal(lobbyData)
			if err != nil {
				log.Fatal(err)
				http.Error(w, "Failed to marshal lobby data.", http.StatusInternalServerError)
				return
			}

			w.WriteHeader(http.StatusOK)
			w.Write(jsonData)
		default:
			http.Error(w, "Method not allowed.", http.StatusMethodNotAllowed)
		}
	}
}

func handleTokenValidation(authService api.AuthService, userService api.UserService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if token := r.URL.Query().Get("token"); token != "" {
			userID, err := authService.ConsumeTemporaryAuthToken(r.Context(), token)
			if err != nil {
				// TODO: handle token validation failure
				log.Fatal(err)
				http.Error(w, "Failed to validate token.", http.StatusInternalServerError)
				return
			}

			user, err := userService.User(userID)
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
}


func lobbyCodeHandler(lobbyService api.LobbyService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code, err := lobbyService.GenerateUniqueLobbyCode(r.Context())
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
}

func lobbyUpdateHandler(lobbyService api.LobbyService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var lobbyState api.LobbyMetadata
		if err := json.NewDecoder(r.Body).Decode(&lobbyState); err != nil {
			log.Fatal(err)
			http.Error(w, "Failed to decode lobby state.", http.StatusBadRequest)
			return
		}


		if err := lobbyService.SaveLobbyState(r.Context(), lobbyState.Code, lobbyState); err != nil {
			log.Fatal(err)
			http.Error(w, "Failed to save lobby state.", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
	}
}
