# Edge Rate Limiter

An end-to-end edge defense demo that blocks abusive traffic before it hits your core services. A Go reverse proxy applies Redis-backed rate limits, a FastAPI ingest pipeline records every decision in Postgres, and a SOLID React/MUI console turns the telemetry into actionable insight.

---

## The Need & The Solution

**What problem does it solve?** Modern APIs are hammered by credential stuffing, scraping, and volumetric floods. Left unchecked, those attacks distort metrics, chew through resources, and frustrate customers.

**How does this project respond?** The edge proxy inspects each request, enforces sliding-window limits per IP and API key, performs light bot heuristics, and emits a structured event stream. Operators watch trends in the dashboard and adjust policy before the bad traffic reaches production backends.

### Core Features

- **Rate limiting & abuse scoring:** Atomic counters in Redis keep deterministic windows, while request metadata (method mix, UA, burst cadence) helps flag likely bots.
- **Centralised event logging:** Every allow/block is pushed to ingest for storage and downstream analytics.
- **Live situational awareness:** The dashboard shows network momentum, traffic split, hotspots, and a live event feed with search and decision filters.
- **Dynamic posture:** Policy changes or node metadata roll out instantly through Redis + ingest updates.

---

## Architecture at a Glance

```
┌────────┐   HTTP    ┌────────────────────────┐
│ Clients├──────────▶│ Edge proxy (Go + Redis) │
└────────┘           │ • Sliding-window limits │
                                         │ • Prometheus metrics    │
                                         └─────────┬───────────────┘
                                                             │ ingest events
                                                             ▼
                                    ┌────────────────────────────┐
                                    │ FastAPI ingest + Postgres   │
                                    │ • Persist structured events │
                                    │ • Serve `/v1/events`        │
                                    └─────────┬───────────────────┘
                                                             │ REST
                                                             ▼
                                    ┌────────────────────────────┐
                                    │ React/MUI console (nginx)   │
                                    │ • Network Momentum          │
                                    │ • Traffic Split & Hotspots  │
                                    │ • Live event stream         │
                                    └────────────────────────────┘

Allowed traffic continues to the bundled `demo-app` backend through the edge proxy.
```

---

## Tech Stack Overview

| Layer | Technology | Why it was chosen |
|-------|------------|-------------------|
| Edge proxy | Go, Redis, Prometheus | High-throughput network IO, deterministic counters, native metrics |
| Ingest | FastAPI, PostgreSQL | Rapid API development, durable event store |
| Demo backend | Node.js (Express) | Lightweight target for allowed traffic |
| UI | React 18, MUI, nginx | Responsive console with SOLID-aligned components and hooks |
| Tooling | Docker Compose, Python attack simulator | One-command orchestration and repeatable traffic scenarios |

---

## Repository Layout

```
edge-rate-limiter/
├── edge/          # Go proxy with internal packages for config, limiter, events, telemetry, server
├── ingest/        # FastAPI ingest API backed by Postgres
├── ui/            # React operations console (components/hooks/utils extracted for SOLID readability)
├── demo-app/      # Sample upstream service used for allowed traffic
├── infra/         # Docker Compose definition
├── tests/         # Traffic simulator and helper scripts
└── README.md
```

---

## Prerequisites

- Docker 24+ with Compose plugin
- Python 3.10+ (optional, for `tests/attack_sim.py`)
- Node.js 18+ if you want to iterate on the UI with `npm start`

---

## Quick Start

```bash
git clone https://github.com/shivsegv/edge-rate-limiter.git
cd edge-rate-limiter/infra
docker compose up --build
```

When containers settle:

- UI dashboard: <http://localhost:3000>
- Edge proxy: <http://localhost:8080>
- Prometheus metrics: <http://localhost:8080/metrics>
- Ingest API: <http://localhost:8081/v1/events>
- Demo upstream app (through edge): <http://localhost:5000>

Tear down with `docker compose down`. Add `-v` to drop Postgres data.

---

## Run the Demo

### 1. Smoke test the edge

```bash
curl -i http://localhost:8080/healthz
curl -i -H "X-API-KEY: goodkey" http://localhost:8080/api/hello
```

Both calls should return `200 OK` and appear immediately in the dashboard.

### 2. Stress the limiter

```bash
python3 ../tests/attack_sim.py \
    --url http://localhost:8080/api/hello \
    --api-key botkey \
    --rps 300 \
    --duration 10
```

Watch Network Momentum spike, Traffic Split tip toward blocked traffic, and the Live Event Stream fill with decision details.

### 3. Explore the dashboard

- **Hero tiles:** Reassure freshness for the edge proxy, ingest pipeline, and demo backend.
- **Network Momentum:** Plots the last 12 minutes; falls back to point markers when data is sparse so the card never feels empty.
- **Traffic Split & Hotspots:** Donut plus ranked lists for endpoints, API keys, HTTP methods, and block reasons.
- **Live Event Stream:** Search by IP, API key, path, reason, or user agent; filter on decisions to audit blocks vs allows.

---

## Configuration Cheat Sheet

| Service | Variable | Default | Purpose |
|---------|----------|---------|---------|
| edge | `REDIS_ADDR` | `redis:6379` | Redis endpoint for counters |
| edge | `DEMO_APP_URL` | `http://demo-app:5000` | Upstream service target |
| edge | `INGEST_SERVICE_URL` | `http://ingest:8081/v1/events` | Telemetry endpoint |
| edge | `EDGE_NODE_NAME` | `edge-1` | Node label included in events |
| ingest | `DATABASE_URL` | `postgresql://postgres:postgres@postgres:5432/postgres` | Postgres DSN |
| ingest | `INGEST_API_KEY` | *(empty)* | Optional shared secret from edge |
| ui/nginx | `API_BASE_URL` | `http://edge:8080` | Reverse-proxy target for `/v1/events` |

Default limits: 100 requests / 60 s per IP and 1000 / 60 s per API key. Adjust `edge/internal/limiter` or extend policy modules for dynamic quotas.

---

## Observability

- Prometheus scrape: `http://localhost:8080/metrics` for counters, latencies, and ingest outcomes.
- Structured events: Postgres stores the decision log served at `/v1/events`.
- Logs: `docker compose logs <service>` remains the quickest way to trace the proxy → ingest flow end to end.

---

## Developing Locally

- **UI:** `cd ui && npm install && npm start`
    - Components sit in `ui/src/components`, hooks in `ui/src/hooks`, and shared helpers in `ui/src/utils` + `ui/src/constants`.
- **Edge (Go):** `cd edge && go test ./...`
    - Internal packages (`config`, `limiter`, `events`, `telemetry`, `server`) keep SOLID boundaries.
- **Ingest (FastAPI):**
    - `cd ingest && pip install -r requirements.txt`
    - `uvicorn main:app --reload --port 8081`
- **Traffic tooling:** `tests/attack_sim.py --help` exposes concurrency, random path, and user-agent knobs for richer simulations.

---

## Demo Script 

1. `cd infra && docker compose up --build -d`
2. Hit `http://localhost:8080/healthz`
3. Open <http://localhost:3000> and call out hero tiles + momentum card
4. Fire a few allowed requests with `curl`
5. Launch the simulator to showcase throttling and block reasons
6. Show Prometheus metrics via `curl http://localhost:8080/metrics | head`

---