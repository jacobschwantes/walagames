package api

type HTTPConfig struct {
	Host           string
	Port           string
	AllowedOrigins string
	APIKey         string
}

type APIClient interface {
	GetUserData(userID string) (*User, error)
}

type User struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	ImageUrl string `json:"imageUrl"`
	Data     struct {
		Friends []string `json:"friends"`
	} `json:"data"`
}

