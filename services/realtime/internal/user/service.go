package user

import (
	"github.com/jacobschwantes/quizblitz/services/realtime/internal"
)

type userService struct {
	repo realtime.UserRepository
}

func NewService(repo realtime.UserRepository) realtime.UserService {
	return &userService{repo}
}

func (us *userService) User(id string) (*realtime.User, error) {
	return us.repo.User(id)
}

func (us *userService) UserBySession(token string) (*realtime.User, error) {
	return us.repo.UserBySession(token)
}
