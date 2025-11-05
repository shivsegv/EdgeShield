package limiter

import "context"

// Limiter determines whether a given key is allowed to proceed.
type Limiter interface {
	Allow(ctx context.Context, key string, windowSeconds int, maxRequests int) (bool, error)
}
