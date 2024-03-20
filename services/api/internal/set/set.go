package set

import (
	"github.com/jacobschwantes/quizblitz/services/api/internal"
	"time"
)

type setService struct {
	repo api.SetRepository
}

func NewService(repo api.SetRepository) api.SetService {
	return &setService{repo}
}

func (ss *setService) Set(id string) (*api.Set, error) {
	return ss.repo.Set(id)
}

func (ss *setService) Sets(userid string) ([]*api.Set, error) {
	return ss.repo.Sets(userid)
}

func (ss *setService) CreateSet(set api.Set) error {
	now := time.Now()
	set.CreatedAt = now
	set.LastActivityAt = now
	set.UpdatedAt = now
	return ss.repo.InsertSet(set)
}
