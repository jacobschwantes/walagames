package http

import (
	"context"
	"log"
	"net/http"

	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type contextKey string

const userContextKey contextKey = "user"

func authMiddleware(next http.HandlerFunc, apiClient realtime.APIClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var player *realtime.Player
		if token := r.URL.Query().Get("token"); token != "" {
			user, err := apiClient.ValidateAuthToken(token)
			if err != nil {
				// TODO: handle token validation failure
				log.Fatal(err)
			}

			player = &realtime.Player{
				Username:      *user.Name,
				ImageURL:      *user.Image,
				Role:          realtime.RoleAuthenticatedPlayer,
				Score:         0,
				Authenticated: true,
				Status:        realtime.Connected,
			}
		} else {
			player = &realtime.Player{
				Username:      "Guest",
				ImageURL:      "",
				Role:          realtime.RoleGuestPlayer,
				Score:         0,
				Authenticated: false,
				Status:        realtime.Connecting,
			}
		}
		ctx := context.WithValue(r.Context(), userContextKey, player)
		next(w, r.WithContext(ctx))
	}
}
