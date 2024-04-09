package mongo

import (
	"context"
	"fmt"
	"time"

	api "github.com/jacobschwantes/quizblitz/services/api/internal"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type quizRepository struct {
	db *mongo.Client
}

func NewSetRepository(db *mongo.Client) api.QuizRepository {
	return &quizRepository{
		db,
	}
}

func (repo *quizRepository) Quiz(id string) (*api.Quiz, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := repo.db.Database("quizblitz").Collection("quiz")
	var quiz api.Quiz
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		fmt.Println("Error converting id to object id: ", err)
		return nil, err
	}
	filter := bson.M{"_id": objectID}
	fmt.Println("Finding quiz with id: ", id)
	err = collection.FindOne(ctx, filter).Decode(&quiz)
	return &quiz, err
}

func (repo *quizRepository) Quizzes(userid string) ([]*api.Quiz, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := repo.db.Database("quizblitz").Collection("quiz")
	filter := bson.M{"owner_id": userid}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		fmt.Println("Error finding quizzes ", err)
		return nil, err
	}
	var quizzes []*api.Quiz
	for cursor.Next(ctx) {
		var quiz api.Quiz
		err := cursor.Decode(&quiz)
		if err != nil {
			fmt.Println("Error decoding quiz: ", err)
			return nil, err
		}
		quizzes = append(quizzes, &quiz)
	}
	return quizzes, nil
}

func (repo *quizRepository) InsertQuiz(quiz api.Quiz) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	collection := repo.db.Database("quizblitz").Collection("quiz")
	res, err := collection.InsertOne(ctx, quiz)
	fmt.Println("Inserted quiz: ", res)
	return err
}

func (repo *quizRepository) UpdateQuiz(id string, quiz api.Quiz) error {
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    collection := repo.db.Database("quizblitz").Collection("quiz")

    objectID, err := primitive.ObjectIDFromHex(id)
    if err != nil {
        fmt.Println("Error converting id to object id: ", err)
        return err
    }

    // Create a new map to hold the update fields, excluding the _id field
    updateFields := bson.M{}
    data, err := bson.Marshal(quiz)
    if err != nil {
        fmt.Println("Error marshalling quiz: ", err)
        return err
    }
    if err := bson.Unmarshal(data, &updateFields); err != nil {
        fmt.Println("Error unmarshalling quiz: ", err)
        return err
    }
    delete(updateFields, "_id") // Remove the _id field

    filter := bson.M{"_id": objectID}
    update := bson.M{"$set": updateFields}
    _, err = collection.UpdateOne(ctx, filter, update)
    return err
}

