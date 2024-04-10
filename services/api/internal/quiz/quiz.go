package quiz

import (
	"github.com/jacobschwantes/quizblitz/services/api/internal"
)

type quizService struct {
	repo api.QuizRepository
}

func NewService(repo api.QuizRepository) api.QuizService {
	return &quizService{repo}
}

func (qs *quizService) Quiz(id string) (*api.Quiz, error) {
	return qs.repo.Quiz(id)
}

func (qs *quizService) Quizzes(userid string) ([]*api.Quiz, error) {
	return qs.repo.Quizzes(userid)
}

func (qs *quizService) CreateQuiz(quiz api.Quiz) (string, error) {
	return qs.repo.InsertQuiz(quiz)
}

func (qs *quizService) UpdateQuiz(id string, quiz api.Quiz) error {
	return qs.repo.UpdateQuiz(id, quiz)
}
