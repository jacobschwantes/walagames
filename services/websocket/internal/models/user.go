package models

import (
	"time"
    "github.com/google/uuid"
    "context"
)

type PlayerRole string

const (
	RoleHost                PlayerRole = "host"
	RoleAuthenticatedPlayer PlayerRole = "authenticated_player"
	RoleGuestPlayer         PlayerRole = "guest_player"
)

// Player represents a user in a game, whether registered, guest, or a host.
type Player struct {
	id            string     `json:"id"`            // Unique identifier for the user
	Username      string     `json:"username"`      // Username of the user
    ImageURL      string     `json:"imageURL,omitempty"`      // URL to the user's profile image
	Role          PlayerRole `json:"role"`          // Role of the user in the system
	Score         int        `json:"score"`         // Player's score in the game
	authenticated bool       `json:"authenticated"` // Whether the user is authenticated (registered)
}

func NewPlayer(username string, imageURL string, role PlayerRole, authenticated bool) *Player {
    return &Player{
        Username:      username,
        ImageURL:      imageURL,
        Role:          role,
        id:            uuid.New().String(),
        Score:         0,
        authenticated: authenticated,
    }
}

// Account represents the Account model which stores the information provided from the OAuth provider
type Account struct {
    ID                string    `json:"id"`
    UserID            string    `json:"userId"`
    Type              string    `json:"type"`
    Provider          string    `json:"provider"`
    ProviderAccountID string    `json:"providerAccountId"`
    RefreshToken      *string   `json:"refreshToken"` // Pointer to handle nullable fields
    AccessToken       *string   `json:"accessToken"`
    ExpiresAt         *int      `json:"expiresAt"`
    TokenType         *string   `json:"tokenType"`
    Scope             *string   `json:"scope"`
    IDToken           *string   `json:"idToken"`
    SessionState      *string   `json:"sessionState"`
    // User relationship is handled by UserID
}

// Session stores the auth session information for the user
type Session struct {
    ID          string    `json:"id"`
    SessionToken string   `json:"sessionToken"`
    UserID      string    `json:"userId"`
    Expires     time.Time `json:"expires"`
    // User relationship is handled by UserID
}

// Main User model which holds identifying information and session/account relationships
// Accounts are setup such that a user can have multiple accounts from different providers
type User struct {
    ID            string      `json:"id"`
    Name          *string     `json:"name"` // Pointer to handle nullable fields
    Email         *string     `json:"email"`
    EmailVerified *time.Time  `json:"emailVerified"`
    Image         *string     `json:"image"`
    // Accounts and Sessions relationships are represented as slices of Account and Session
    Accounts      []Account   `json:"accounts"`
    Sessions      []Session   `json:"sessions"`
}

// !Currently unused
// VerificationToken stores the token and expiration time for email verification
type VerificationToken struct {
    Identifier string    `json:"identifier"`
    Token      string    `json:"token"`
    Expires    time.Time `json:"expires"`
}


// UserRepository defines the interface for user data operations.
type UserRepository interface {
	GetUserById(id string) (*User, error)
	GetUserBySessionToken(token string) (*User, error)
    CreateTemporaryAuthToken(ctx context.Context, id string) (string, error)
    ConsumeTemporaryAuthToken(ctx context.Context, token string) (string, error)
}