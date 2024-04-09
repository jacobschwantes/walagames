package api

import "time"

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
	Plays  int     `json:"plays" bson:"plays"`
	Stars  int     `json:"stars" bson:"stars"`
	// Rating float32 `json:"rating" bson:"rating"`
}
type QuizMeta struct {
	Title       string `json:"title" bson:"title"`
	Description string `json:"description" bson:"description"`
	Category    string `json:"category" bson:"category"`
	Public      bool   `json:"public" bson:"public"`
	ImageSrc    string `json:"image_src" bson:"image_src"`
}

type QuizVisibility string

const (
	VisibilityPublic        QuizVisibility = "public"
	VisibilityPrivate       QuizVisibility = "private"
	VisibilityCollaborators QuizVisibility = "collaborators"
	VisibilityFriends       QuizVisibility = "friends"
)

type QuizRepository interface {
	Quiz(id string) (*Quiz, error)
	Quizzes(userId string) ([]*Quiz, error)
	InsertQuiz(Quiz Quiz) error
	UpdateQuiz(id string, Quiz Quiz) error
}

type QuizService interface {
	Quiz(id string) (*Quiz, error)
	Quizzes(userId string) ([]*Quiz, error)
	CreateQuiz(quiz Quiz) error
	UpdateQuiz(id string, quiz Quiz) error
}
