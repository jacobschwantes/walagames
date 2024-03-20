package mongo

import (
	"context"
	"fmt"
	"time"

	"github.com/jacobschwantes/quizblitz/services/api/internal"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type setRepository struct {
	db *mongo.Client
}

func NewSetRepository(db *mongo.Client) api.SetRepository {
	return &setRepository{
		db,
	}
}

func (repo *setRepository) Set(id string) (*api.Set, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := repo.db.Database("quizblitz").Collection("sets")
	var set api.Set
	err := collection.FindOne(ctx, map[string]string{"id": id}).Decode(&set)
	return &set, err
}

func (repo *setRepository) Sets(userid string) ([]*api.Set, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := repo.db.Database("quizblitz").Collection("sets")
	cursor, err := collection.Find(ctx, bson.M{"owner_id": userid})
	if err != nil {
		fmt.Println("Error finding sets: ", err)
		return nil, err
	}
	var sets []*api.Set
	for cursor.Next(ctx) {
		var set api.Set
		err := cursor.Decode(&set)
		if err != nil {
			fmt.Println("Error decoding set: ", err)
			return nil, err
		}
		sets = append(sets, &set)
	}
	return sets, nil
}

func (repo *setRepository) InsertSet(set api.Set) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := repo.db.Database("quizblitz").Collection("sets")
	res, err := collection.InsertOne(ctx, set)
	fmt.Println("Inserted set: ", res)
	return err
}
