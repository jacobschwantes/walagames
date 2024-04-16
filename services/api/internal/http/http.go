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

func ServeHTTP(
	ctx context.Context,
	config api.HTTPConfig,
	authService api.AuthService,
	userService api.UserService,
	lobbyService api.LobbyService,
	quizService api.QuizService,
) error {
	srv := NewServer(
		authService,
		userService,
		lobbyService,
		quizService,
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
		fmt.Println("\napi server shut down")
	}()
	wg.Wait()
	return nil
}

func NewServer(
	authService api.AuthService,
	userService api.UserService,
	lobbyService api.LobbyService,
	setService api.QuizService,
) *http.Handler {
	mux := http.NewServeMux()

	// TODO: rate limiting middleware
	// todo: logging middleware

	addInternalRoutes(
		mux,
		authService,
		userService,
		lobbyService,
		setService,
	)
	addPublicRoutes(
		mux,
		authService,
		userService,
		lobbyService,
		setService,
	)

	var handler http.Handler = mux
	// ? handler = logging.NewLoggingMiddleware(logger, handler)
	// !some routes need to bypass auth middleware
	// ? consider name : checkAuthHeaders or other
	handler = authHeaderMiddleware(handler)
	return &handler
}

func addInternalRoutes(
	mux *http.ServeMux,
	authService api.AuthService,
	userService api.UserService,
	lobbyService api.LobbyService,
	qs api.QuizService,
) {
	mux.Handle("/internal/auth/validate", internalOnly(handleTokenValidation(authService, userService))) // exchange temp auth token for user info
	mux.Handle("/internal/lobby/create", internalOnly(lobbyCreateHandler(lobbyService)))                 // get assigned a unique lobby code and initialize lobby in metadata store
	mux.Handle("/internal/lobby/update", internalOnly(lobbyUpdateHandler(lobbyService)))
	mux.Handle("/internal/quiz", internalOnly(fetchQuizHandler(qs))) // update lobby meta data
	// mux.Handle("/internal/lobby/close", internalOnly(lobbyCloseHandler(lobbyService))) evict a lobby from metadata store
	// mux.Handle("/internal/server/health", internalOnly(healthCheckHandler())) report server health
	// mux.Handle("GET /internal/set/{id}", internalOnly(setHandler()) fetch a set by id, need to make sure user has access to it
	// mux.Handle("POST /internal/game/results", internalOnly(gameResultsHandler()) update user data using game results (e.g. history, score, xp, etc)
}

func addPublicRoutes(mux *http.ServeMux, authService api.AuthService, userService api.UserService, lobbyService api.LobbyService, quizService api.QuizService) {
	mux.Handle("/lobby", internalOnly(userMiddleware(issueAuthTokenMiddleware(lobbyJoinHandler(lobbyService), authService), userService))) // join a lobby
	mux.Handle("/lobby/host", internalOnly(userMiddleware(issueAuthTokenMiddleware(lobbyHostHandler(), authService), userService)))        // create a lobby

	mux.Handle("/quiz", quizHandler(quizService))       // crud for sets, POST ignores id slug, make sure user has access to set
	mux.Handle("/quizzes", quizzesHandler(quizService)) // list sets, gets all sets user has access to
}

// * allows the use of context values but still take advantage of the type safety of function parameters
/*
func main() {
  mux := http.NewServeMux()
  mux.HandleFunc("/", homeHandler)

  http.ListenAndServe(":3000", addRequestID(addLogger(mux)))
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
  ctx := r.Context()
  reqID := GetRequestID(ctx)
  logger := GetLogger(ctx)
  home(w, r, reqID, logger)
}

func home(w http.ResponseWriter, r *http.Request, requestID int, logger *Logger) {
  logger.Println("Here is a log")
  fmt.Fprintln(w, "Homepage...")
}

*/
