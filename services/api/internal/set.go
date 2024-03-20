package api

import "time"

type Set struct {
	ID               string              `json:"id,omitempty" bson:"_id,omitempty"`
	OwnerID          string              `json:"owner_id" bson:"owner_id"`
	Collaborators    []string            `json:"collaborators" bson:"collaborators"`
	Name             string              `json:"name" bson:"name"`
	Description      string              `json:"description" bson:"description"`
	ImageURL         string              `json:"image_url" bson:"image_url"`
	Tags             []SetTag            `json:"tags" bson:"tags"`
	Terms            []Term              `json:"terms" bson:"terms"`
	Visibility       SetVisibility       `json:"visibility" bson:"visibility"`
	Version          string              `json:"version" bson:"version"`
	LastActivityAt   time.Time           `json:"last_activity_at" bson:"last_activity_at"`
	CreatedAt        time.Time           `json:"created_at "bson:"created_at"`
	UpdatedAt        time.Time           `json:"updated_at" bson:"updated_at"` 
	Likes            int                 `json:"likes" bson:"likes"`
	CompletionStatus SetCompletionStatus `json:"completion_status" bson:"completion_status"`
}

type SetVisibility string

const (
	VisibilityPublic        SetVisibility = "public"
	VisibilityPrivate       SetVisibility = "private"
	VisibilityCollaborators SetVisibility = "collaborators"
	VisibilityFriends       SetVisibility = "friends"
)

type SetCompletionStatus struct {
	Completed  int  `json:"completed"`
	Total      int  `json:"total"`
	InProgress bool `json:"in_progress"`
}

type Term struct {
	ID             string    `json:"id"`
	OwnerID        string    `json:"owner_id"`
	Term           string    `json:"term"`
	Definition     string    `json:"definition"`
	Tags           []TermTag `json:"tags"`
	LastActivityAt time.Time `json:"last_activity_at"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type SetTag struct {
	ID  string `json:"id"`
	Tag string `json:"tag"`
}

type TermTag struct {
	ID  string `json:"id"`
	Tag string `json:"tag"`
}

type SetRepository interface {
	Set(id string) (*Set, error)
	Sets(userid string) ([]*Set, error)
	InsertSet(set Set) error
}

type SetService interface {
	Set(id string) (*Set, error)
	Sets(userid string) ([]*Set, error)
	CreateSet(set Set) error
}
