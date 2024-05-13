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
	cfg api.HTTPConfig,
	qr api.QuizRepository,
	api api.APIClient,
	sm api.StreamManager,
) error {
	srv := NewServer(
		qr,
		cfg,
		api,
		sm,
	)
	httpServer := &http.Server{
		Addr:    net.JoinHostPort(cfg.Host, cfg.Port),
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
		fmt.Println("\napi server shut down")
	}()
	wg.Wait()
	return nil
}

func NewServer(
	qr api.QuizRepository,
	cfg api.HTTPConfig,
	api api.APIClient,
	sm api.StreamManager,
) *http.Handler {
	mux := http.NewServeMux()

	addRoutes(
		mux,
		qr,
		api,
		sm,
	)

	var handler http.Handler = mux
	handler = withCors(handler, cfg.AllowedOrigins)
	handler = internalOnly(handler, cfg.APIKey)
	return &handler
}

func addRoutes(mux *http.ServeMux, qr api.QuizRepository, api api.APIClient, sm api.StreamManager) {
	mux.Handle("/quiz", withUserID(quiz(qr)))
	mux.Handle("/quiz/{id}", withUserID(quizByID(qr)))
	mux.Handle("/quizzes", withUserID(quizzes(qr)))
	mux.Handle("/events", withUserID(events(api, sm)))
}