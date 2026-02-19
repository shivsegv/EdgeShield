package server

import (
	"net/http"
	"strings"
	"time"

	"edgeshield/edge/internal/config"
	"edgeshield/edge/internal/domain"
	"edgeshield/edge/internal/events"
	"edgeshield/edge/internal/limiter"
	"edgeshield/edge/internal/telemetry"
)

// Handler coordinates proxying, rate limiting, and telemetry emission.
type Handler struct {
	cfg     config.Config
	limiter limiter.Limiter
	events  *events.Dispatcher
	metrics *telemetry.Metrics
	proxy   http.Handler
}

// NewHandler constructs an HTTP handler.
func NewHandler(cfg config.Config, limiter limiter.Limiter, dispatcher *events.Dispatcher, metrics *telemetry.Metrics, proxy http.Handler) *Handler {
	return &Handler{
		cfg:     cfg,
		limiter: limiter,
		events:  dispatcher,
		metrics: metrics,
		proxy:   proxy,
	}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" && r.Method == http.MethodGet {
		w.Header().Set("Content-Type", "text/plain; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("edge-ok"))
		return
	}

	start := time.Now()
	decision := "error"
	method := r.Method
	defer func() {
		h.metrics.ObserveRequest(method, decision, time.Since(start))
	}()

	clientIP := getClientIP(r)
	apiKey := r.Header.Get("X-API-KEY")

	rateKey := ""
	maxRequests := h.cfg.IPMaxRequests
	if apiKey != "" {
		rateKey = "api_key:" + apiKey
		maxRequests = h.cfg.APIKeyMaxRequests
	} else {
		rateKey = "ip:" + clientIP
	}

	allowed, err := h.limiter.Allow(r.Context(), rateKey, h.cfg.WindowSeconds, maxRequests)
	if err != nil {
		h.respondError(w)
		return
	}

	statusCode := http.StatusOK
	decision = "allowed"
	reason := ""
	score := 0.0

	if !allowed {
		statusCode = http.StatusTooManyRequests
		reason = "rate_limit"
		score = 1.0
		decision = "blocked"
		h.respondRateLimit(w)
	} else {
		recorder := &statusRecorder{ResponseWriter: w, status: http.StatusOK}
		h.proxy.ServeHTTP(recorder, r)
		statusCode = recorder.status
	}

	fingerprint := fingerprintFromRequest(r)
	telemetryEvent := domain.Event{
		Timestamp:   time.Now().UTC(),
		EdgeNode:    h.cfg.EdgeNode,
		ClientIP:    clientIP,
		APIKey:      apiKey,
		Path:        r.URL.Path,
		Method:      r.Method,
		Status:      statusCode,
		Decision:    decision,
		Reason:      reason,
		Score:       score,
		Fingerprint: fingerprint,
	}

	h.events.Enqueue(telemetryEvent)
}

func (h *Handler) respondError(w http.ResponseWriter) {
	http.Error(w, "Internal Server Error", http.StatusInternalServerError)
}

func (h *Handler) respondRateLimit(w http.ResponseWriter) {
	http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
}

func fingerprintFromRequest(r *http.Request) map[string]string {
	fingerprint := map[string]string{}
	if ua := r.UserAgent(); ua != "" {
		fingerprint["ua"] = ua
	}
	if ref := r.Referer(); ref != "" {
		fingerprint["referer"] = ref
	}
	if len(fingerprint) == 0 {
		return nil
	}
	return fingerprint
}

func getClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		ip := strings.Split(xff, ",")[0]
		return strings.TrimSpace(ip)
	}
	return strings.Split(r.RemoteAddr, ":")[0]
}

type statusRecorder struct {
	http.ResponseWriter
	status int
}

func (s *statusRecorder) WriteHeader(code int) {
	s.status = code
	s.ResponseWriter.WriteHeader(code)
}
