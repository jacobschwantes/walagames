package auth

import (
	"context"
	"crypto/rand"
	"github.com/jacobschwantes/quizblitz/services/api/internal"
)

func generateAuthToken(length int) (string, error) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i := 0; i < length; i++ {
		b[i] = charset[b[i]%byte(len(charset))]
	}
	return string(b), nil
}

type authService struct {
	repo api.AuthRepository
}

func NewService(repo api.AuthRepository) api.AuthService {
	return &authService{repo}
}

func (as *authService) CreateTemporaryAuthToken(ctx context.Context, userID string) (string, error) {
	token, err := generateAuthToken(8)
	if err != nil {
		return "", err
	}

	err = as.repo.InsertTemporaryAuthToken(ctx, token, userID)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (as *authService) ConsumeTemporaryAuthToken(ctx context.Context, token string) (string, error) {
	userID, err := as.repo.RetrieveTemporaryAuthToken(ctx, token)
	if err != nil {
		return "", err
	}

	err = as.repo.EvictTemporaryAuthToken(ctx, token)
	if err != nil {
		return "", err
	}

	return userID, nil
}
