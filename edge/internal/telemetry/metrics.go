package telemetry

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// Metrics wraps Prometheus collectors used by the edge service.
type Metrics struct {
	requestsTotal   *prometheus.CounterVec
	requestLatency  *prometheus.HistogramVec
	ingestFailures  prometheus.Counter
	droppedEvents   prometheus.Counter
	eventQueueDepth prometheus.Gauge
}

// NewMetrics registers metrics with the provided registry and returns a helper instance.
func NewMetrics(registry *prometheus.Registry) *Metrics {
	m := &Metrics{
		requestsTotal: prometheus.NewCounterVec(
			prometheus.CounterOpts{
				Name: "edge_requests_total",
				Help: "Total number of requests processed by the edge service, labelled by decision and method.",
			},
			[]string{"decision", "method"},
		),
		requestLatency: prometheus.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "edge_request_duration_seconds",
				Help:    "Latency distribution for requests handled by the edge service.",
				Buckets: prometheus.DefBuckets,
			},
			[]string{"method"},
		),
		ingestFailures: prometheus.NewCounter(
			prometheus.CounterOpts{
				Name: "edge_ingest_failures_total",
				Help: "Number of times emitting telemetry to the ingest service failed.",
			},
		),
		droppedEvents: prometheus.NewCounter(
			prometheus.CounterOpts{
				Name: "edge_dropped_events_total",
				Help: "Number of telemetry events dropped because the edge queue was full.",
			},
		),
		eventQueueDepth: prometheus.NewGauge(
			prometheus.GaugeOpts{
				Name: "edge_event_queue_depth",
				Help: "Current number of telemetry events waiting to be delivered to ingest.",
			},
		),
	}

	registry.MustRegister(m.requestsTotal, m.requestLatency, m.ingestFailures, m.droppedEvents, m.eventQueueDepth)
	return m
}

// Handler returns an HTTP handler for the metrics endpoint.
func Handler(registry *prometheus.Registry) http.Handler {
	return promhttp.HandlerFor(registry, promhttp.HandlerOpts{})
}

// ObserveRequest records a completed request decision.
func (m *Metrics) ObserveRequest(method, decision string, duration time.Duration) {
	m.requestLatency.WithLabelValues(method).Observe(duration.Seconds())
	m.requestsTotal.WithLabelValues(decision, method).Inc()
}

// TrackQueueDepth sets the queue depth gauge.
func (m *Metrics) TrackQueueDepth(depth int) {
	m.eventQueueDepth.Set(float64(depth))
}

// IncrementDroppedEvents increments the dropped event counter.
func (m *Metrics) IncrementDroppedEvents() {
	m.droppedEvents.Inc()
}

// IncrementIngestFailures increments the ingest failure counter.
func (m *Metrics) IncrementIngestFailures() {
	m.ingestFailures.Inc()
}
