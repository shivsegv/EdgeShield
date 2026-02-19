package main

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os/signal"
	"syscall"
	"time"

	"edgeshield/edge/internal/config"
	"edgeshield/edge/internal/events"
	"edgeshield/edge/internal/ingest"
	"edgeshield/edge/internal/limiter"
	"edgeshield/edge/internal/server"
	"edgeshield/edge/internal/telemetry"

	"github.com/go-redis/redis/v8"
	"github.com/prometheus/client_golang/prometheus"
)

func main() {
	cfg := config.Load()

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	redisClient := redis.NewClient(&redis.Options{Addr: cfg.RedisAddr})
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("unable to connect to redis at %s: %v", cfg.RedisAddr, err)
	}
	defer redisClient.Close()

	limiterService := limiter.NewRedisLimiter(redisClient)

	registry := prometheus.NewRegistry()
	metrics := telemetry.NewMetrics(registry)

	ingestPublisher := ingest.NewHTTPPublisher(cfg.IngestURL, cfg.IngestTimeout)
	eventDispatcher := events.NewDispatcher(cfg.EventQueueSize, ingestPublisher, metrics)
	go eventDispatcher.Run(ctx)

	proxy := newReverseProxy(cfg.DemoAppURL)
	handler := server.NewHandler(cfg, limiterService, eventDispatcher, metrics, proxy)

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", server.HealthHandler)
	mux.Handle("/metrics", telemetry.Handler(registry))
	mux.Handle("/", handler)

	srv := &http.Server{
		Addr:    cfg.ListenAddr,
		Handler: mux,
	}

	go func() {
		<-ctx.Done()
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := srv.Shutdown(shutdownCtx); err != nil {
			log.Printf("error shutting down server: %v", err)
		}
	}()

	log.Printf("Edge service listening on %s", cfg.ListenAddr)
	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("failed to start server: %v", err)
	}
}

func newReverseProxy(target string) http.Handler {
	parsed, err := url.Parse(target)
	if err != nil {
		log.Fatalf("invalid DEMO_APP_URL %q: %v", target, err)
	}
	proxy := httputil.NewSingleHostReverseProxy(parsed)
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, proxyErr error) {
		log.Printf("proxy error: %v", proxyErr)
		http.Error(w, "Upstream unavailable", http.StatusBadGateway)
	}
	return proxy
}
