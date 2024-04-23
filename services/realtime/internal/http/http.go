package http

import (
	"context"
	"net/http"

	"fmt"
	"log"
	"os"
	"sync"
	"time"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

func ServeHTTP(
	ctx context.Context,
	cfg *realtime.HTTPConfig,
	lc realtime.LobbyController,
	api realtime.APIClient,
	auth realtime.AuthTokenManager,
) error {
	srv := NewServer(lc, api, auth, cfg)

	httpServer := &http.Server{
		Addr:    cfg.Host + ":" + cfg.Port,
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
		shutdownCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			fmt.Fprintf(os.Stderr, "error shutting down http server: %s\n", err)
		}
		fmt.Println("\nrealtime server shut down")
	}()
	wg.Wait()
	return nil
}

func NewServer(lc realtime.LobbyController, api realtime.APIClient, auth realtime.AuthTokenManager, cfg *realtime.HTTPConfig) *http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	mux.Handle("/join/{code}", internalOnly(join(lc, auth), cfg.APIKey))
	mux.Handle("/host", internalOnly(host(api, lc, auth), cfg.APIKey))
	mux.Handle("/connect", connect(lc, auth))

	var handler http.Handler = mux
	handler = withCors(handler, cfg.AllowedOrigins)
	return &handler
}
