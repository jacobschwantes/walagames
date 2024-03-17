package user

import (
	"github.com/jacobschwantes/quizblitz/services/api/internal"
)

type userService struct {
	repo api.UserRepository
}

func NewService(repo api.UserRepository) api.UserService {
	return &userService{repo}
}

func (us *userService) User(id string) (*api.User, error) {
	return us.repo.User(id)
}

func (us *userService) UserBySession(token string) (*api.User, error) {
	return us.repo.UserBySession(token)
}
