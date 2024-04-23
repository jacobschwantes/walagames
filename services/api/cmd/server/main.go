package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"

	"github.com/joho/godotenv"

	"github.com/jacobschwantes/quizblitz/services/api/internal"
	"github.com/jacobschwantes/quizblitz/services/api/internal/http"
	"github.com/jacobschwantes/quizblitz/services/api/internal/mongo"
)

func run(ctx context.Context) error {
	err := godotenv.Load()
	if err != nil {
		return err
	}

	cfg := api.HTTPConfig{
		Host: os.Getenv("HOST"),
		Port: os.Getenv("PORT"),
		AllowedOrigins: os.Getenv("CORS_ALLOWED_ORIGINS"),
		APIKey: os.Getenv("API_KEY"),
	}

	ctx, cancel := signal.NotifyContext(ctx, os.Interrupt)
	defer cancel()

	mdb := mongo.NewClient(os.Getenv("MONGO_URI"))
	defer func() {
		if err := mdb.Disconnect(ctx); err != nil {
			log.Fatal("Failed to disconnect from MongoDB: ", err)
			panic(err)
		}
	}()

	qr := mongo.NewQuizRepository(mdb)
	http.ServeHTTP(ctx, cfg, qr)

	return nil
}

func main() {
	ctx := context.Background()
	if err := run(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err)
		os.Exit(1)
	}
}
