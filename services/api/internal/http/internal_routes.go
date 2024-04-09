package http

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/FusionAuth/go-client/pkg/fusionauth"
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
			const host = "http://localhost:9011"

			var apiKey = os.Getenv("FUSIONAUTH_API_KEY")

			var httpClient = &http.Client{
				Timeout: time.Second * 10,
			}

			var baseURL, _ = url.Parse(host)

			{ /*  Construct a new FusionAuth Client */
			}
			var client = fusionauth.NewClient(httpClient, baseURL, apiKey)

			response, errors, err := client.RetrieveUser(userID)
			if err != nil {
				// err is a transport layer error (connection failed, etc)
				fmt.Println(err)
				return
			}
			if errors != nil {
				// err is a FusionAuth response error (user couldn't be found, etc)
				fmt.Println(response.StatusCode)
				return
			}
			fmt.Println(response.User.Email)
			fmt.Println(response.User.FirstName)
			fmt.Println(response.User.LastName)

			var user = &api.User{
				ID:    userID,
				Email: &response.User.Email,
				Name:  &response.User.FullName,
				Image: &response.User.ImageUrl,
			}

			// user, err := userService.User(userID)
			// if err != nil {
			// 	// todo: handle user not found

			// 	log.Fatal(err)
			// 	http.Error(w, "User not found.", http.StatusNotFound)
			// 	return
			// }

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

// TODO: initialize a lobby along with the code in redis
func lobbyCreateHandler(lobbyService api.LobbyService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		code, err := lobbyService.GenerateUniqueLobbyCode(r.Context())
		if err != nil {
			http.Error(w, "Failed to generate lobby code.", http.StatusInternalServerError)
			return
		}

		err = lobbyService.SaveLobbyState(r.Context(), code, api.LobbyMetadata{Code: code,
			HostServer:  "localhost:8081",
			MaxPlayers:  4,
			PlayerCount: 0,
		})
		if err != nil {
			http.Error(w, "Failed to save lobby state.", http.StatusInternalServerError)
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
