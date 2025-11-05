package domain

import "time"

// Event represents the telemetry emitted for each edge decision.
type Event struct {
	Timestamp   time.Time         `json:"timestamp"`
	EdgeNode    string            `json:"edge_node"`
	ClientIP    string            `json:"client_ip"`
	APIKey      string            `json:"api_key,omitempty"`
	Path        string            `json:"path"`
	Method      string            `json:"method"`
	Status      int               `json:"status"`
	Decision    string            `json:"decision"`
	Reason      string            `json:"reason,omitempty"`
	Score       float64           `json:"score,omitempty"`
	Fingerprint map[string]string `json:"fingerprint,omitempty"`
}
