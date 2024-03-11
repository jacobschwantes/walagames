package http

import (
	"net/http"

	"log"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type Router struct {
	lobbyService realtime.LobbyManager
	userService  realtime.UserService
	authService  realtime.AuthService
}

func NewRouter(lm realtime.LobbyManager, us realtime.UserService, as realtime.AuthService) *Router {
	return &Router{lm, us, as}
}

func (rtr *Router) ServeHTTP() {
	mux := http.NewServeMux()

	// TODO: rate limiting middleware
	// todo: logging middleware

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	mux.Handle("/auth", http.HandlerFunc(rtr.authHandler))

	mux.Handle("/lobby/connect", rtr.authMiddleware(http.HandlerFunc(rtr.lobbyHandler)))

	// mux.HandleFunc("/lobby/exists", rtr.lobbyExistsHandler)

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
		return
	}
}
