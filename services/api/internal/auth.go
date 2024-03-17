package api

import (
	"context"
)

// AuthRepository handles storage and retrieval of auth tokens.
type AuthRepository interface {
    // RetrieveTemporaryAuthToken retrieves an associated userID by token.
    RetrieveTemporaryAuthToken(ctx context.Context, token string) (userID string, err error)
    
    // InsertTemporaryAuthToken stores a new token with an associated userID.
    InsertTemporaryAuthToken(ctx context.Context, token string, id string) error
    
    // EvictTemporaryAuthToken removes a token from storage.
    EvictTemporaryAuthToken(ctx context.Context, token string) error
}

// AuthService manages the creation and consumption of auth tokens.
type AuthService interface {
    // CreateTemporaryAuthToken creates and stores a new auth token.
    CreateTemporaryAuthToken(ctx context.Context, userID string) (token string, err error)
    
    // ConsumeTemporaryAuthToken validates and removes a token, returning the userID.
    ConsumeTemporaryAuthToken(ctx context.Context, token string) (userID string, err error)
}