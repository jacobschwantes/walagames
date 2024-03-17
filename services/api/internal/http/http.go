package http

import (
	"net/http"
	"github.com/jacobschwantes/quizblitz/services/api/internal"
	"log"
)

type Router struct {
	authService api.AuthService
	userService api.UserService
}

func NewRouter(as api.AuthService, us api.UserService) *Router {
	return &Router{as, us}
}

func (rtr *Router) ServeHTTP() {
	mux := http.NewServeMux()

	// TODO: rate limiting middleware
	// todo: logging middleware

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	mux.Handle("/auth", http.HandlerFunc(rtr.authHandler))

	mux.Handle("/auth/validate", http.HandlerFunc(rtr.tokenValidateHandler))

	mux.Handle("/lobby/code", http.HandlerFunc(rtr.lobbyCodeHandler))


	// mux.HandleFunc("/lobby/exists", rtr.lobbyExistsHandler)

	err := http.ListenAndServe(":8081", mux)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
		return
	}
}
