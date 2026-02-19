package ingest

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"edgeshield/edge/internal/domain"
)

// Publisher represents something that can emit telemetry events to a downstream system.
type Publisher interface {
	Publish(ctx context.Context, events []domain.Event) error
}

// HTTPPublisher sends events to an HTTP endpoint.
type HTTPPublisher struct {
	client *http.Client
	url    string
}

// NewHTTPPublisher creates a publisher that posts events to the ingest API.
func NewHTTPPublisher(url string, timeout time.Duration) *HTTPPublisher {
	return &HTTPPublisher{
		client: &http.Client{Timeout: timeout},
		url:    url,
	}
}

// Publish sends the provided events to the ingest service.
func (p *HTTPPublisher) Publish(ctx context.Context, events []domain.Event) error {
	if len(events) == 0 {
		return nil
	}

	payload, err := json.Marshal(events)
	if err != nil {
		return fmt.Errorf("marshal events: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, p.url, bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("create ingest request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.client.Do(req)
	if err != nil {
		return fmt.Errorf("send ingest request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("ingest service returned status %d", resp.StatusCode)
	}

	return nil
}
