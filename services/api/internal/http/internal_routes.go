package http 

import (
	"encoding/json"
	"log"
	"net/http"
	"github.com/jacobschwantes/quizblitz/services/api/internal"
)

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
func lobbyCreateHandler(lobbyService api.LobbyService) http.HandlerFunc {
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