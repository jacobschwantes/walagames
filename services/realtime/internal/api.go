package realtime

import "time"

type Quiz struct {
	ID        string     `json:"id,omitempty" bson:"_id,omitempty"`
	OwnerID   string     `json:"owner_id" bson:"ownerID"`
	Meta      QuizMeta   `json:"meta" bson:"meta"`
	Questions []Question `json:"questions" bson:"questions"`
	Stats     QuizStats  `json:"stats" bson:"stats"`
	CreatedAt time.Time  `json:"created_at" bson:"createdAt"`
	UpdatedAt time.Time  `json:"updated_at" bson:"updatedAt"`
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
	Image       string `json:"image" bson:"image"`
}

type APIClient interface {
	FetchQuiz(id string, userID string) (*Quiz, error)
}

type HTTPConfig struct {
	Host           string
	Port           string
	APIEndpoint    string
	APIKey         string
	AllowedOrigins string
}
