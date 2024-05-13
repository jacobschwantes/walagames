package api

import (
	"net/http"
)

type StreamManager interface {
	Serve(w http.ResponseWriter, r *http.Request, userID string, friends []string) error
	Publish(userID string, msg []byte) error
}
