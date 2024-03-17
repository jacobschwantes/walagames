package realtime

import "time"

type UserInfo struct {
	ID            string     `json:"id"`
	Name          *string    `json:"name"` // Pointer to handle nullable fields
	Email         *string    `json:"email"`
	EmailVerified *time.Time `json:"emailVerified"`
	Image         *string    `json:"image"`
}

type SetData struct {
	// Set data fields
}

type APIClient interface {
	ValidateAuthToken(token string) (*UserInfo, error)
	GetLobbyCode() (string, error)
	FetchSetData(setId int) (*SetData, error)
}
