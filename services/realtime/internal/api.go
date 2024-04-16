package realtime

import "time"

type UserInfo struct {
	ID            string     `json:"id"`
	Name          *string    `json:"name"` // Pointer to handle nullable fields
	Email         *string    `json:"email"`
	EmailVerified *time.Time `json:"emailVerified"`
	Image         *string    `json:"image"`
}

type Quiz struct {
	ID        string     `json:"id,omitempty" bson:"_id,omitempty"`
	OwnerID   string     `json:"owner_id" bson:"owner_id"`
	Meta      QuizMeta   `json:"meta" bson:"meta"`
	Questions []Question `json:"questions" bson:"questions"`
	Stats     QuizStats  `json:"stats" bson:"stats"`
	CreatedAt time.Time  `json:"created_at" bson:"created_at"`
	UpdatedAt time.Time  `json:"updated_at" bson:"updated_at"`
}
type Question struct {
	ID       string   `json:"id" bson:"id"`
	Question string   `json:"question" bson:"question"`
	Answers  []Answer `json:"answers" bson:"answers"`
}
type Answer struct {
	ID      string `json:"id" bson:"id"`
	Text    string `json:"text" bson:"text"`
	Correct bool   `json:"correct" bson:"correct"`
}
type QuizStats struct {
	Plays int `json:"plays" bson:"plays"`
	Stars int `json:"stars" bson:"stars"`
	// Rating float32 `json:"rating" bson:"rating"`
}
type QuizMeta struct {
	Title       string `json:"title" bson:"title"`
	Description string `json:"description" bson:"description"`
	Category    string `json:"category" bson:"category"`
	Public      bool   `json:"public" bson:"public"`
	Image       Image  `json:"image" bson:"image"`
}

type Image struct {
	Src  string    `json:"src" bson:"src"`
	Meta ImageMeta `json:"meta" bson:"meta"`
}
type ImageMeta struct {
	Color Color `json:"color" bson:"color"`
}
type Color struct {
	R uint8 `json:"r" bson:"r"`
	G uint8 `json:"g" bson:"g"`
	B uint8 `json:"b" bson:"b"`
}

type QuizVisibility string

const (
	VisibilityPublic        QuizVisibility = "public"
	VisibilityPrivate       QuizVisibility = "private"
	VisibilityCollaborators QuizVisibility = "collaborators"
	VisibilityFriends       QuizVisibility = "friends"
)


type APIClient interface {
	ValidateAuthToken(token string) (*UserInfo, error)
	GetLobbyCode() (string, error)
	FetchQuiz(id string) (*Quiz, error)
	PushLobbyStateUpdate(update LobbyStateUpdate) error
}

type LobbyStateUpdate struct {
	Code        string `json:"code,omitempty"`
	PlayerCount int    `json:"playerCount,omitempty"`
	MaxPlayers  int    `json:"maxPlayers,omitempty"`
	HostServer  string `json:"hostServer,omitempty"`
}

type HTTPConfig struct {
	Host string `json:"host"`
	Port string `json:"port"`
}
