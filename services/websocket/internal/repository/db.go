package repository

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"github.com/redis/go-redis/v9"

)

func NewRedisClient(ctx context.Context, options *redis.Options) *redis.Client {
	rdb := redis.NewClient(options)

	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatal("RedisConnectError:", err)
		panic(err)
	}

	fmt.Println("Successfully connected to Redis database")
	return rdb
}

func NewPostgresClient(connStr string) *sql.DB {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("PostgresConnectionError: ", err)
		panic(err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatal("PostgresPingError: ", err)
		panic(err)
	}

	fmt.Println("Successfully connected to Postgres database")
	return db
}
