package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"sync"
	"time"

	realtime "github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type tokenEntry struct {
	UserID    string
	LobbyCode string
	ExpiresAt time.Time
}

type authTokenManager struct {
	tokens map[string]*tokenEntry
	lock   sync.Mutex
	ttl    time.Duration
}

func NewTokenManager(ttl time.Duration) realtime.AuthTokenManager {
	m := &authTokenManager{
		tokens: make(map[string]*tokenEntry),
		ttl:    ttl,
	}
	go m.cleanupExpiredTokens()
	return m
}

func (m *authTokenManager) GenerateToken(userID string, lobbyCode string) (string, error) {
	tokenBytes := make([]byte, 16) // Generates a 128-bit token
	if _, err := rand.Read(tokenBytes); err != nil {
		return "", err
	}
	token := hex.EncodeToString(tokenBytes)

	tokenEntry := &tokenEntry{
		UserID:    userID,
		LobbyCode: lobbyCode,
		ExpiresAt: time.Now().Add(time.Second * 30), // ! remove hard coding
	}

	m.lock.Lock()
	defer m.lock.Unlock()

	if _, exists := m.tokens[token]; exists {
		return m.GenerateToken(userID, lobbyCode)
	}
	m.tokens[token] = tokenEntry
	return token, nil
}

func (m *authTokenManager) ValidateToken(token string) (string, string, error) {
	m.lock.Lock()
	defer m.lock.Unlock()

	if entry, exists := m.tokens[token]; exists {
		if time.Now().Compare(entry.ExpiresAt) >= 0 {
			delete(m.tokens, token)
			return "", "", fmt.Errorf("token expired")
		}
		return entry.UserID, entry.LobbyCode, nil
	}

	return "", "", fmt.Errorf("token not found")
}

func (m *authTokenManager) cleanupExpiredTokens() {
	ticker := time.NewTicker(time.Minute)
	for range ticker.C {
		m.lock.Lock()
		for token, entry := range m.tokens {
			if time.Now().Compare(entry.ExpiresAt) <= 0 {
				delete(m.tokens, token)
			}
		}
		m.lock.Unlock()
	}
}
