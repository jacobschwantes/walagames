package realtime

import (
	"time"
)

// Account represents the Account model which stores the information provided from the OAuth provider
type Account struct {
	ID                string  `json:"id"`
	UserID            string  `json:"userId"`
	Type              string  `json:"type"`
	Provider          string  `json:"provider"`
	ProviderAccountID string  `json:"providerAccountId"`
	RefreshToken      *string `json:"refreshToken"` // Pointer to handle nullable fields
	AccessToken       *string `json:"accessToken"`
	ExpiresAt         *int    `json:"expiresAt"`
	TokenType         *string `json:"tokenType"`
	Scope             *string `json:"scope"`
	IDToken           *string `json:"idToken"`
	SessionState      *string `json:"sessionState"`
	// User relationship is handled by UserID
}

// Session stores the auth session information for the user
type Session struct {
	ID           string    `json:"id"`
	SessionToken string    `json:"sessionToken"`
	UserID       string    `json:"userId"`
	Expires      time.Time `json:"expires"`
	// User relationship is handled by UserID
}

// Main User model which holds identifying information and session/account relationships
// Accounts are setup such that a user can have multiple accounts from different providers
type User struct {
	ID            string     `json:"id"`
	Name          *string    `json:"name"` // Pointer to handle nullable fields
	Email         *string    `json:"email"`
	EmailVerified *time.Time `json:"emailVerified"`
	Image         *string    `json:"image"`
	// Accounts and Sessions relationships are represented as slices of Account and Session
	Accounts []Account `json:"accounts"`
	Sessions []Session `json:"sessions"`
}

// UserRepository defines the interface for user data operations.
type UserRepository interface {
	User(id string) (*User, error)
	UserBySession(token string) (*User, error)
}

// UserService provides user data operations.
type UserService interface {
	User(id string) (*User, error)
	UserBySession(token string) (*User, error)
}
