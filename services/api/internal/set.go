package api

import "time"

type Set struct {
	ID               int
	OwnerID          int
	Collaborators    []int
	Name             string
	Description      string
	ImageURL         string
	Tags             []SetTag
	Terms            []Term
	Visibility       SetVisibility
	Version          int
	LastActivityAt   time.Time
	CreatedAt        time.Time
	UpdatedAt        time.Time
	Likes            int
	CompletionStatus SetCompletionStatus
}

type SetVisibility string

const (
	VisibilityPublic        SetVisibility = "public"
	VisibilityPrivate       SetVisibility = "private"
	VisibilityCollaborators SetVisibility = "collaborators"
	VisibilityFriends       SetVisibility = "friends"
)

type SetCompletionStatus struct {
	Completed  int
	Total      int
	InProgress bool
}

type Term struct {
	ID             int
	OwnerID        int
	Term           string
	Definition     string
	Tags           []TermTag
	LastActivityAt time.Time
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

type SetTag struct {
	ID  int
	Tag string
}

type TermTag struct {
	ID  int
	Tag string
}

type SetRepository interface {
	Set(id int) (*Set, error)
}
