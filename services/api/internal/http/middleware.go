package http

import (
	"context"
	"net/http"
)

type contextKey string

const userIDContextKey contextKey = "userID"

func withUserID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Header.Get("X-User-ID")
		if userID == "" {
			http.Error(w, "X-User-ID header missing", http.StatusBadRequest)
			return
		}

		ctx := context.WithValue(r.Context(), userIDContextKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func getUserID(ctx context.Context) string {
	userID, ok := ctx.Value(userIDContextKey).(string)
	if !ok {
		return ""
	}
	return userID
}

func internalOnly(next http.Handler, apiKey string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !isInternal(r, apiKey) {
			http.NotFound(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func isInternal(r *http.Request, apiKey string) bool {
	if authHeader := r.Header.Get("Authorization"); authHeader != "" {
		return authHeader == apiKey
	}
	return false
}

func withCors(next http.Handler, allowedOrigins string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// w.Header().Set("Access-Control-Allow-Origin", allowedOrigins)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
