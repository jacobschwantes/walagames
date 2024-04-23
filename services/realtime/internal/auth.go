package realtime


type AuthTokenManager interface {
	GenerateToken(userID string, lobbyCode string) (string, error)
	ValidateToken(token string) (string, string, error)
}