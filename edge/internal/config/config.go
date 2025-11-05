package config

import (
	"log"
	"os"
	"strconv"
	"time"
)

const (
	defaultListenAddr         = ":8080"
	defaultRedisAddr          = "redis:6379"
	defaultDemoAppURL         = "http://demo-app:5000"
	defaultIngestURL          = "http://ingest:8081/v1/events"
	defaultEdgeNode           = "edge-1"
	defaultWindowSeconds      = 60
	defaultIPMaxRequests      = 100
	defaultAPIKeyMaxRequests  = 1000
	defaultEventQueueCapacity = 1024
	defaultIngestTimeout      = 3 * time.Second
)

// Config captures the runtime configuration for the edge proxy.
type Config struct {
	ListenAddr        string
	RedisAddr         string
	DemoAppURL        string
	IngestURL         string
	EdgeNode          string
	WindowSeconds     int
	IPMaxRequests     int
	APIKeyMaxRequests int
	EventQueueSize    int
	IngestTimeout     time.Duration
}

// Load reads configuration from environment variables while applying sane defaults.
func Load() Config {
	cfg := Config{
		ListenAddr:        defaultListenAddr,
		RedisAddr:         defaultRedisAddr,
		DemoAppURL:        defaultDemoAppURL,
		IngestURL:         defaultIngestURL,
		EdgeNode:          defaultEdgeNode,
		WindowSeconds:     defaultWindowSeconds,
		IPMaxRequests:     defaultIPMaxRequests,
		APIKeyMaxRequests: defaultAPIKeyMaxRequests,
		EventQueueSize:    defaultEventQueueCapacity,
		IngestTimeout:     defaultIngestTimeout,
	}

	setString(&cfg.ListenAddr, "EDGE_LISTEN_ADDR")
	setString(&cfg.RedisAddr, "REDIS_ADDR")
	setString(&cfg.DemoAppURL, "DEMO_APP_URL")
	setString(&cfg.IngestURL, "INGEST_SERVICE_URL")
	setString(&cfg.EdgeNode, "EDGE_NODE_NAME")
	setInt(&cfg.WindowSeconds, "RATE_LIMIT_WINDOW_SECONDS")
	setInt(&cfg.IPMaxRequests, "RATE_LIMIT_IP_MAX")
	setInt(&cfg.APIKeyMaxRequests, "RATE_LIMIT_API_KEY_MAX")
	setInt(&cfg.EventQueueSize, "EVENT_QUEUE_SIZE")
	setDuration(&cfg.IngestTimeout, "INGEST_HTTP_TIMEOUT")

	return cfg
}

func setString(target *string, envKey string) {
	if value := os.Getenv(envKey); value != "" {
		*target = value
	}
}

func setInt(target *int, envKey string) {
	if value := os.Getenv(envKey); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil {
			log.Printf("invalid value for %s: %v", envKey, err)
			return
		}
		*target = parsed
	}
}

func setDuration(target *time.Duration, envKey string) {
	if value := os.Getenv(envKey); value != "" {
		dur, err := time.ParseDuration(value)
		if err != nil {
			log.Printf("invalid duration for %s: %v", envKey, err)
			return
		}
		*target = dur
	}
}
