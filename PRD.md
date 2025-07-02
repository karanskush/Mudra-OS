Below is a **fully-fleshed Product Requirements Document (PRD)** for the ultra-lean Fintech-OS demo, written with implementation-level depth for a Go code-base.  It is structured so you can drop it into `docs/PRD.md` and execute the project line-by-line.

---

## Executive overview

The goal is to ship a **single-binary sandbox** that models real double-entry accounting, cost-optimised multi-rail payments, nightly reconciliation, basic compliance filings, webhooks and auto-generated SDKs—all on synthetic data.  A reviewer must be able to `git clone && make run`, watch money move in the browser and download a SAR/GST report in **< 5 minutes** on any laptop.

---

## 1 — Architecture at a glance

```
cmd/finos            --> main()  ➜ chi router + grpc-gateway
internal/ledger      --> PostJournal(), Balance()
internal/payments    --> CreatePayment(), async worker
internal/routing     --> Optimiser (rail_costs → cheapest)
internal/recon       --> CSV importer → recon_variances
internal/compliance  --> SAR & GST PDF/CSV generator
internal/webhooks    --> HMAC queue + retry
web/                 --> HTMX + Tailwind dashboard
scripts/             --> demo.sh, seed.sql, settlements CSV
```

*Why this layout?* It mirrors the widely-adopted **`cmd/`, `internal/`, `pkg/` pattern** recommended by the community standard-project-layout repo ([github.com][1], [reddit.com][2]), making the repo instantly recognisable to Go reviewers.

---

## 2 — Detailed functional scope

| Tag     | Module          | MVP behaviour                                                                    | Key tables                        |
| ------- | --------------- | -------------------------------------------------------------------------------- | --------------------------------- |
| **L**   | Ledger          | Balanced journals, idempotent by `external_id`, time-travel balances             | `accounts`, `journals`, `entries` |
| **P**   | Payments        | `POST /v1/payments` → reserve funds, pick rail, emit **pending** status          | `payments`                        |
| **SR**  | Smart Router    | Compute *landed cost* (fixed + FX bps) per rail; pick cheapest ≤ SLA sec         | `rail_costs`, `payment_options`   |
| **R**   | Reconciliation  | Nightly job ingests mock settlement CSV, compares ledger totals, saves variances | `rail_reports`, `recon_variances` |
| **C**   | Compliance      | Generate SAR / GST PDFs + CSVs for a date range                                  | `compliance_reports`              |
| **K**   | KYC/Risk        | Fetch RandomUser profile, run Rego/JSONLogic; hot-reload policies                | `kyc_profiles`                    |
| **W**   | Webhooks + SDKs | HMAC-signed JSON to subscriber; `make sdk` zips Go+TS clients                    | `webhook_subs`                    |
| **UI**  | Ops console     | HTMX dashboard (balances, ₹ saved), live table via SSE, payment form             | –                                 |
| **OBS** | Observability   | `slog` JSON logs, `/metrics` Prometheus counters & histograms                    | –                                 |
| **SEC** | Security        | 5 req/s IP limit, CSRF token, `.env` secrets hashed with bcrypt                  | –                                 |

---

## 3 — Implementation blueprint

### 3.1 Ledger (`internal/ledger`)

* **Schema**—two-table design from proven double-entry discussions keeps balance by construction ([dba.stackexchange.com][3], [stackoverflow.com][4]).
* **TX model**—wrap `PostJournal` in `BEGIN IMMEDIATE` to leverage SQLite’s WAL durability ([sqlite.org][5]).
* **Tests**—property-based suite (`gopter`) must hit 100 % branch coverage for this package.

### 3.2 API layer

* **Protobuf first**; generate both gRPC and REST via **grpc-gateway** ([github.com][6], [medium.com][7]).
* HTTP lives under `/v1/*`; gRPC on the same port with `grpc-web` enabled for SSE/streaming.

### 3.3 Routing optimiser (`internal/routing`)

* Table `rail_costs` is seeded with fixed fee, FX bps and SLA.
* `Optimise(req)` sorts candidate rails by *total landed cost* (fee + spread) and returns the cheapest meeting SLA.
* ₹ saved per tx is `(worst_cost – chosen_cost)`; exposed in dashboard.

### 3.4 Payment rails (`pkg/rails`)

Minimal adapters implement:

```go
type Rail interface {
   Quote(ctx context.Context, in QuoteReq) (QuoteResp, error)
   Execute(ctx context.Context, in ExecReq)  (PaymentID, error)
   Track(ctx context.Context, id PaymentID)  (Status, error)
}
```

Dummy rails include:

* **UPI**: 0.10 % fee, 5–15 s latency
* **SEPA**: 30 bps FX, D+1 latency
* **Crypto**: 5 bps + “gas” field, 1 block latency

### 3.5 Reconciliation (`internal/recon`)

* Background goroutine every midnight loads `./seed/settlements/{rail}_{date}.csv`.
* CSV spec: `rail,currency,amount`.
* Variance > ₹ 1 rows inserted into `recon_variances`; a `recon.failed` webhook is fired.

### 3.6 Compliance reports (`internal/compliance`)

* Uses **GoFPDF** to render regulator-style PDFs; small binary size, zero deps ([github.com][8], [wilson-tech.medium.com][9]).
* Hot-switch via build tag `report_pdf`; CSV always generated.

### 3.7 Policy engine (`internal/policy`)

* Embeds **OPA**; bundles hot-reload policies so editing `policy.rego` takes effect without restart ([openpolicyagent.org][10], [openpolicyagent.org][11]).

### 3.8 Observability

* Metrics exported via `promhttp` following the official Go guide ([prometheus.io][12], [civo.com][13]).
* Counters: `payments_total`, `payments_failed`; histogram: `payment_latency_seconds`.

### 3.9 Web console (`web/`)

* Pure HTMX + Tailwind—no JS build chain, following server-rendered SPA pattern ([reddit.com][14], [htmx.org][15]).
* `/dashboard` pulls balances every 3 s via `hx-get`; row colours update live via SSE channel.

### 3.10 Webhooks & SDKs

* HMAC-SHA256 over body using subscriber’s `secret`; three retries (3 s, 9 s, 27 s).
* `make sdk` calls `oapi-codegen` to emit Go & TS clients, zipped for download.

---

## 4 — Dev-experience commands

| Target       | Action                                             |
| ------------ | -------------------------------------------------- |
| `make run`   | `go run ./cmd/finos` → migrate, seed, open browser |
| `make seed`  | Reseed 50 companies, 10 k tx                       |
| `make recon` | Run reconciliation job once                        |
| `make sdk`   | Generate & zip language SDKs                       |
| `make test`  | Run unit + integration tests, show coverage        |
| `make lint`  | `golangci-lint` gate                               |

---

## 5 — Acceptance test matrix

| Scenario            | Steps                                | Expected                                              |
| ------------------- | ------------------------------------ | ----------------------------------------------------- |
| Happy payment       | UI → create ₹25 000->EUR             | Row yellow → green in < 15 s; ₹ saved widget > 0      |
| Reconciliation fail | Append bad line to CSV, `make recon` | UI alert badge red; variance row present              |
| SAR report          | Call `/reports/sar?date=TODAY`       | PDF/CSV file links returned (200)                     |
| Webhook delivery    | Register tunnel URL, trigger payment | JSON payload delivered within 500 ms; signature valid |
| SDK compile         | Unzip SDK, `go vet ./...` & `tsc`    | No errors                                             |

---

## 6 — Timeline (10 calendar days)

| Day | Deliverable                                       |
| --- | ------------------------------------------------- |
| 1   | Project scaffold, migrations, ledger tests        |
| 2   | Payment service + 3 rails                         |
| 3   | Routing optimiser + ₹ saved widget                |
| 4   | Async status worker + SSE                         |
| 5   | Recon CSV emitter & variance UI                   |
| 6   | Compliance PDF/CSV endpoints                      |
| 7   | Webhooks engine + `make sdk`                      |
| 8   | Prometheus + structured `slog` logs               |
| 9   | Security hardening (rate-limit, CSRF), README GIF |
| 10  | Peer run-through, buffer, release tag `v0.1.0`    |

---

## 7 — Known limits / future work

* SQLite WAL may stall under high write concurrency—switch to Postgres when moving from demo to PoC ([sqlite.org][5]).
* No auth layer; for demo only.
* Webhooks delivered sequentially; production version should push to queue for fan-out.
* Real PSP sandboxes (Stripe Test Clock, Razorpay Mock) earmarked for v0.2.

---

**With this PRD, every feature, package, schema and make-target is spelled out—any Go engineer can start coding today and hit a runnable demo in ten calendar days.**

[1]: https://github.com/golang-standards/project-layout?utm_source=chatgpt.com "Standard Go Project Layout - GitHub"
[2]: https://www.reddit.com/r/golang/comments/11oh2mr/the_oneandonly_musthave_eternal_go_project_layout/?utm_source=chatgpt.com "The one-and-only, must-have, eternal Go project layout - Reddit"
[3]: https://dba.stackexchange.com/questions/102370/double-entry-bookkeeping-database-design?utm_source=chatgpt.com "Double entry bookkeeping database design"
[4]: https://stackoverflow.com/questions/59432964/relational-data-model-for-double-entry-accounting?utm_source=chatgpt.com "Relational Data Model for Double-Entry Accounting - Stack Overflow"
[5]: https://www.sqlite.org/wal.html?utm_source=chatgpt.com "Write-Ahead Logging - SQLite"
[6]: https://github.com/grpc-ecosystem/grpc-gateway?utm_source=chatgpt.com "grpc-ecosystem/grpc-gateway: gRPC to JSON proxy generator ..."
[7]: https://medium.com/%40patrickkoss/bridging-rest-and-grpc-with-grpc-gateway-in-golang-an-illustrative-guide-afb4e2f02975?utm_source=chatgpt.com "Bridging REST and gRPC with gRPC Gateway in Golang - Medium"
[8]: https://github.com/jung-kurt/gofpdf?utm_source=chatgpt.com "jung-kurt/gofpdf: A PDF document generator with high level ... - GitHub"
[9]: https://wilson-tech.medium.com/generate-invoice-pdf-in-go-77851615a518?utm_source=chatgpt.com "Generate invoice PDF in Go - Wilson Tan - Medium"
[10]: https://openpolicyagent.org/docs?utm_source=chatgpt.com "Introduction | Open Policy Agent"
[11]: https://openpolicyagent.org/docs/management-bundles?utm_source=chatgpt.com "Bundles - Open Policy Agent"
[12]: https://prometheus.io/docs/guides/go-application/?utm_source=chatgpt.com "Instrumenting a Go application for Prometheus"
[13]: https://www.civo.com/learn/build-your-own-prometheus-exporter-in-go?utm_source=chatgpt.com "Build Your Own Prometheus Exporter in Go - Civo Cloud"
[14]: https://www.reddit.com/r/golang/comments/14yhlo2/go_htmx_tailwind_and_javascript_single_page/?utm_source=chatgpt.com "Go, HTMX, Tailwind, and Javascript | Single Page Applications for ..."
[15]: https://htmx.org/examples/?utm_source=chatgpt.com "</> htmx ~ Examples"
