package realtime

// TODO: move this to its own dependency
import "github.com/google/uuid"

type PlayerRole string

const (
	RoleHost                PlayerRole = "host"
	RoleAuthenticatedPlayer PlayerRole = "authenticated_player"
	RoleGuestPlayer         PlayerRole = "guest_player"
)

// Player represents a user in a game, whether registered, guest, or a host.
type Player struct {
	ID            string     `json:"id"`                 // Unique identifier for the user
	Username      string     `json:"username"`           // Username of the user
	ImageURL      string     `json:"imageURL,omitempty"` // URL to the user's profile image
	Role          PlayerRole `json:"role"`               // Role of the user in the system
	Score         int        `json:"score"`              // Player's score in the game
	Authenticated bool       `json:"authenticated"`      // Whether the user is authenticated (registered)
}

func NewPlayer(username string, imageURL string, role PlayerRole, authenticated bool) *Player {
	return &Player{
		Username:      username,
		ImageURL:      imageURL,
		Role:          role,
		ID:            uuid.New().String(),
		Score:         0,
		Authenticated: authenticated,
	}
}
