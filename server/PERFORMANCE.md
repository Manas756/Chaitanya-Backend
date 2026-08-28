# Performance Results

These are local measurements, not production guarantees. Environment: Node.js API on localhost, MongoDB connected, 10-second client-side benchmark, successful HTTP responses only.

| Endpoint | Concurrency | Requests/sec | p50 | p95 | p99 | Errors |
|---|---:|---:|---:|---:|---:|---:|
| GET `/health` | 100 | 20,711 | 5 ms | 6 ms | 8 ms | 0 |
| GET `/api/events` before pagination | 10 | 53.5 | 112 ms | 469 ms | 1,633 ms | 0 |
| GET `/api/events` before pagination | 50 | 43.2 | 1,180 ms | 1,780 ms | 2,939 ms | 0 |
| GET `/api/events` after pagination | 10 | 48.7 | 129 ms | 735 ms | 861 ms | 0 |
| GET `/api/events` Redis cache hit | 100 | 10,779.9 | 7 ms | 17 ms | 20 ms | 0 |
| GET `/api/events` Redis cache hit | 250 | 14,573.2 | 15 ms | 35 ms | 42 ms | 0 |
| GET `/api/events` Redis cache hit | 500 | 4,965.2 | 12 ms | 76 ms | 164 ms | 0* |

## Commands

From `server/`:

```text
npm start
npm run test:load
autocannon -c 10 -d 10 http://localhost:3000/api/events
autocannon -c 50 -d 10 http://localhost:3000/api/events
autocannon -c 100 -d 10 http://localhost:3000/api/events
```

Latest post-change run: `autocannon -c 10 -d 10 http://localhost:3000/api/events` completed 497 requests in 10.1 seconds, averaging 48.7 req/sec, with 0 errors. The dataset was empty, so this is a routing/database baseline rather than a realistic populated production result.

Latest cache-hit runs completed 108k requests at 100 connections and 146k requests at 250 connections with no reported errors. The 500-connection run completed 50k requests but had severe latency variance and is not a stable capacity target. This single-host result reaches 10k-15k req/sec for cached public reads, not 20k reliably.

A benchmark is valid only when the error count is zero. Destructive registration and payment writes must use a dedicated test database and test credentials; they must not be load-tested against production data.

The lightweight health result is an application/HTTP ceiling. Database-backed throughput is dominated by MongoDB latency, indexes, payload size, and deployment resources. Run the same matrix after deployment to establish the real capacity for that environment.
