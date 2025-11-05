package limiter

import (
	"context"
	"fmt"
	"strconv"
	"sync/atomic"
	"time"

	"github.com/go-redis/redis/v8"
)

// RedisLimiter implements Limiter using Redis sorted sets.
type RedisLimiter struct {
	client *redis.Client
	seq    uint64
}

// NewRedisLimiter constructs a limiter backed by Redis.
func NewRedisLimiter(client *redis.Client) *RedisLimiter {
	return &RedisLimiter{client: client}
}

// Allow applies a sliding window check for the provided key.
func (l *RedisLimiter) Allow(ctx context.Context, key string, windowSeconds int, maxRequests int) (bool, error) {
	now := time.Now().UnixMilli()
	windowStart := now - int64(windowSeconds*1000)

	pipe := l.client.TxPipeline()
	pipe.ZRemRangeByScore(ctx, key, "-inf", strconv.FormatInt(windowStart, 10))
	member := fmt.Sprintf("%d:%d", now, atomic.AddUint64(&l.seq, 1))
	pipe.ZAdd(ctx, key, &redis.Z{Score: float64(now), Member: member})
	pipe.Expire(ctx, key, time.Duration(windowSeconds)*time.Second)
	countCmd := pipe.ZCard(ctx, key)

	if _, err := pipe.Exec(ctx); err != nil {
		return false, err
	}

	count, err := countCmd.Result()
	if err != nil {
		return false, err
	}

	return count <= int64(maxRequests), nil
}
