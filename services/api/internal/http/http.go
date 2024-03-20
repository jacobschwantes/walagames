package http

import (
	"context"
	"fmt"
	"github.com/jacobschwantes/quizblitz/services/api/internal"
	"log"
	"net"
	"net/http"
	"os"
	"sync"
	"time"
)

func ServeHTTP(ctx context.Context, config api.HTTPConfig, authService api.AuthService, userService api.UserService, lobbyService api.LobbyService, setService api.SetService) error {
	srv := NewServer(
		authService,
		userService,
		lobbyService,
		setService,
	)
	httpServer := &http.Server{
		Addr:    net.JoinHostPort(config.Host, config.Port),
		Handler: *srv,
	}
	go func() {
		log.Printf("listening on %s\n", httpServer.Addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "error listening and serving: %s\n", err)
		}
	}()
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		<-ctx.Done()
		// make a new context for shutdown
		// shutdownCtx := context.Background()
		shutdownCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			fmt.Fprintf(os.Stderr, "error shutting down http server: %s\n", err)
		}
		fmt.Println("\nhttp server shut down")
	}()
	wg.Wait()
	return nil
}

func NewServer(authService api.AuthService, userService api.UserService, lobbyService api.LobbyService, setService api.SetService) *http.Handler {
	mux := http.NewServeMux()

	// TODO: rate limiting middleware
	// todo: logging middleware

	addInternalRoutes(mux, authService, userService, lobbyService)
	addPublicRoutes(mux, authService, userService, lobbyService, setService)

	var handler http.Handler = mux
	// !some routes need to bypass auth middleware
	handler = authHeaderMiddleware(handler)
	return &handler
}

// ?NOTE: It may be simpler just to use the update handler for everything instad of having a dedicated create end point since the
// ?NOTE: lobby code already exists in the store, and we're just updating it with new metadata
// ?NOTE: We could also initialize it ourselves since we already know the server that requested the code, we could just fill in the rest with defaults
func addInternalRoutes(mux *http.ServeMux, authService api.AuthService, userService api.UserService, lobbyService api.LobbyService) {
	mux.Handle("/internal/auth/validate", internalOnly(handleTokenValidation(authService, userService))) // exchange temp auth token for user info
	mux.Handle("/internal/lobby/create", internalOnly(lobbyCreateHandler(lobbyService)))                 // get assigned a unique lobby code
	mux.Handle("/internal/lobby/update", internalOnly(lobbyUpdateHandler(lobbyService)))                 // update lobby meta data
	// TODO: implement these handlers
	// mux.Handle("/internal/lobby/close", internalOnly(lobbyCloseHandler(lobbyService))) evict a lobby from metadata store
	// mux.Handle("/internal/server/health", internalOnly(healthCheckHandler())) report server health
	// mux.Handle("GET /internal/set/{id}", internalOnly(setHandler()) fetch a set by id, need to make sure user has access to it
	// mux.Handle("POST /internal/game/results", internalOnly(gameResultsHandler()) update user data using game results (e.g. history, score, xp, etc)
}

func addPublicRoutes(mux *http.ServeMux, authService api.AuthService, userService api.UserService, lobbyService api.LobbyService, setService api.SetService) {
	mux.Handle("/lobby/{code}", userMiddleware(issueAuthTokenMiddleware(lobbyJoinHandler(lobbyService), authService), userService)) // join a lobby
	mux.Handle("/lobby/host", userMiddleware(issueAuthTokenMiddleware(lobbyHostHandler(), authService), userService))               // create a lobby

	mux.Handle("/set", userMiddleware(setHandler(setService), userService))   // crud for sets, POST ignores id slug, make sure user has access to set
	mux.Handle("/sets", userMiddleware(setsHandler(setService), userService)) // list sets, gets all sets user has access to
}
