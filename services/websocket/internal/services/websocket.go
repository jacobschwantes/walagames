package services

import (
	
	"net/http"

	"github.com/gorilla/websocket"


)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		allowedOrigin := "http://localhost:3000" // Adjust this to match your Next.js app's origin
		return r.Header.Get("Origin") == allowedOrigin
	},
}



func UpgradeToWebSocketConnection(w http.ResponseWriter, r *http.Request) (*websocket.Conn, error) {
	return upgrader.Upgrade(w, r, nil)
}