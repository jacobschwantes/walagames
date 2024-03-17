package http

import (
	"net/http"

	"log"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type Router struct {
	lobbyService realtime.LobbyManager
	apiClient realtime.APIClient

}

func NewRouter(lm realtime.LobbyManager, ac realtime.APIClient) *Router {
	return &Router{lm, ac}
}

func (rtr *Router) ServeHTTP() {
	mux := http.NewServeMux()

	// TODO: rate limiting middleware
	// todo: logging middleware

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})


	mux.Handle("/lobby/connect", rtr.authMiddleware(http.HandlerFunc(rtr.lobbyHandler)))

	// mux.HandleFunc("/lobby/exists", rtr.lobbyExistsHandler)

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
		return
	}
}
