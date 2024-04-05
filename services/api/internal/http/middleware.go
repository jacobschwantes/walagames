package http

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"strings"

	api "github.com/jacobschwantes/quizblitz/services/api/internal"
)

type contextKey string

const authHeaderContextKey contextKey = "authHeader"
const authTokenContextKey contextKey = "authToken"
const userContextKey contextKey = "userID"

func internalOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !isInternal(r) {
			http.NotFound(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ! add server ip check back in later
func isInternal(r *http.Request) bool {
	// isServer := isServerClient(r)
	authHeader := r.Context().Value(authHeaderContextKey).(string)
	isValidAuthToken := authHeader == os.Getenv("INTERNAL_API_KEY")
	return isValidAuthToken
	// return isServer && isValidAuthToken
}

func isServerClient(r *http.Request) bool {
	// ! Would be better to load these into a map at startup for faster lookups
	realtimeServerIPs := strings.Split(os.Getenv("REALTIME_SERVER_IPS"), ",")
	clientIP := getClientIP(r)
	for _, ip := range realtimeServerIPs {
		if clientIP == ip {
			return true
		}
	}
	return false
}

func getClientIP(r *http.Request) string {
	// Check if the X-Forwarded-For header is set (common in proxy scenarios)
	xForwardedFor := r.Header.Get("X-Forwarded-For")
	if xForwardedFor != "" {
		// This header can contain multiple IPs separated by commas.
		// The first one is usually the original client's IP.
		return strings.Split(xForwardedFor, ",")[0]
	}

	// If X-Forwarded-For is not set, use RemoteAddr
	// Note: RemoteAddr includes the port, so we remove it if present
	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr // Fallback to the full RemoteAddr if splitting fails
	}
	return ip
}

func authHeaderMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			log.Fatal("Authorization header is required and must start with 'Bearer '.")
			http.Error(w, "Authorization header is required and must start with 'Bearer '.", http.StatusBadRequest)
			return
		}

		// Extract the token and add it to the context
		authHeader = authHeader[len("Bearer "):]
		ctx := context.WithValue(r.Context(), authHeaderContextKey, authHeader)
		// Pass the request with the new context to the next handler
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func issueAuthTokenMiddleware(next http.Handler, authService api.AuthService) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		userID := r.Context().Value(userContextKey).(string)
		token, err := authService.CreateTemporaryAuthToken(r.Context(), userID)
		if err != nil {
			log.Fatal(err)
			http.Error(w, "Failed to generate temporary authentication token.", http.StatusInternalServerError)
			return
		}

		// add token to context
		ctx := context.WithValue(r.Context(), authTokenContextKey, token)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// *NOTE: when using contexts for user data:
// A good rule of thumb is that any data required for a function to run should
// be passed as parameters. Sometimes, for example, it can be useful to keep
// values such as usernames in context values for use when logging information
// for later. However, if the username is used to determine if a function should
// display some specific information, you’d want to include it as a function
// parameter even if it’s already available from the context. This way when you,
// or someone else, looks at the function in the future, it’s easier to see
// which data is actually being used.

func userMiddleware(next http.Handler, userService api.UserService) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		// sessionToken := r.Context().Value(authHeaderContextKey).(string)

		// user, err := userService.UserBySession(sessionToken)
		// if err != nil {
		// 	log.Fatal(err)
		// 	http.Error(w, "Failed to get user info.", http.StatusInternalServerError)
		// 	return
		// }
		fmt.Println("user middleware")
		type userReq struct {
			UserID string `json:"userid"`
		}

		var userid userReq

		err := json.NewDecoder(r.Body).Decode(&userid)
		if err != nil {
			fmt.Println("Failed to decode user id.")
			log.Fatal(err)
			http.Error(w, "Failed to decode user id.", http.StatusBadRequest)
			return
		}

		fmt.Println("user id: ", userid.UserID)

		ctx := context.WithValue(r.Context(), userContextKey, userid.UserID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// context cancellation example
/*
ctx := context.Background()
resultsCh := make(chan *WorkResult)

for {
	select {
	case <- ctx.Done():
		// The context is over, stop processing results
		return
	case result := <- resultsCh:
		// Process the results received
	}
}
*/
