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

func (router *Router) ServeHTTP() {
	mux := http.NewServeMux()

	// TODO: rate limiting middleware

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	mux.HandleFunc("/auth", func(w http.ResponseWriter, r *http.Request) {
		authHandler(router.userService, router.authService, w, r)
	})

	mux.HandleFunc("/join/{lobbyCode}", func(w http.ResponseWriter, r *http.Request) {
		joinHandler(router.lobbyService, router.userService, router.authService, w, r)
	})

	mux.HandleFunc("/host", func(w http.ResponseWriter, r *http.Request) {
		hostHandler(router.lobbyService, router.userService, router.authService, w, r)
	})

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
		return
	}
}
