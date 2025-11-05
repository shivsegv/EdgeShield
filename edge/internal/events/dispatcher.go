package events

import (
	"context"
	"log"

	"edge-rate-limiter/edge/internal/domain"
	"edge-rate-limiter/edge/internal/ingest"
	"edge-rate-limiter/edge/internal/telemetry"
)

// Dispatcher handles asynchronous delivery of telemetry events.
type Dispatcher struct {
	queue     chan domain.Event
	publisher ingest.Publisher
	metrics   *telemetry.Metrics
}

// NewDispatcher returns a dispatcher with the given queue capacity.
func NewDispatcher(capacity int, publisher ingest.Publisher, metrics *telemetry.Metrics) *Dispatcher {
	return &Dispatcher{
		queue:     make(chan domain.Event, capacity),
		publisher: publisher,
		metrics:   metrics,
	}
}

// Enqueue schedules an event for asynchronous delivery.
func (d *Dispatcher) Enqueue(evt domain.Event) {
	select {
	case d.queue <- evt:
		d.metrics.TrackQueueDepth(len(d.queue))
	default:
		d.metrics.IncrementDroppedEvents()
		log.Printf("Dropping telemetry event for %s %s: queue full", evt.Method, evt.Path)
	}
}

// Run begins processing events until the context is cancelled.
func (d *Dispatcher) Run(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case evt := <-d.queue:
			d.metrics.TrackQueueDepth(len(d.queue))
			if err := d.publisher.Publish(ctx, []domain.Event{evt}); err != nil {
				d.metrics.IncrementIngestFailures()
				log.Printf("Failed to deliver event to ingest: %v", err)
			}
			d.metrics.TrackQueueDepth(len(d.queue))
		}
	}
}
