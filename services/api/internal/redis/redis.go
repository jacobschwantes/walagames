package redis

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

func NewClient(ctx context.Context, connStr string) *redis.Client {
	options, err := redis.ParseURL(connStr)
	if err != nil {
		log.Fatal("RedisParseURLError:", err)
		panic(err)
	}

	rdb := redis.NewClient(options)
	_, err = rdb.Ping(ctx).Result()
	if err != nil {
		log.Fatal("RedisConnectError:", err)
		panic(err)
	}

	fmt.Println("Successfully connected to Redis database")
	return rdb
}