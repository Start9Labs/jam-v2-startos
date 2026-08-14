<p align="center">
  <img src="icon.svg" alt="Jam V2 Logo" width="21%">
</p>

# Jam V2 on StartOS

> **Upstream docs:** <https://jamdocs.org/>
>
> Everything not listed in this document should behave the same as upstream
> Jam. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable.

[Jam](https://github.com/joinmarket-webui/jam) is a web interface for JoinMarket, a CoinJoin implementation that lets users improve the privacy of their bitcoin by making collaborative transactions. This package wraps the upstream `jam-standalone-ng` image, which bundles the web UI, the [joinmarket-ng](https://github.com/joinmarket-ng/joinmarket-ng) backend, an orderbook watcher, nginx and Tor.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| | |
| --- | --- |
| Image source | Upstream `ghcr.io/joinmarket-webui/jam-standalone-ng`, unmodified |
| Architectures | `x86_64`, `aarch64` |
| Entrypoint | Upstream default, via `sdk.useEntrypoint()` with `runAsInit: true` |
| Process supervision | s6-overlay v3 |
| User | root |

The image supervises four processes: `nginx` (serves the UI and proxies the API), `jmwalletd` (the JoinMarket wallet daemon), `obwatcher` (the orderbook watcher), and `tor`.

Tor runs **inside** this container. The package does not depend on the StartOS Tor service, because JoinMarket's maker needs a Tor control port to publish its own onion service, which a shared SOCKS proxy does not provide.

## Volume and Data Layout

| Volume | Subpath | Mount point | Purpose |
| --- | --- | --- | --- |
| `main` | `./data` | `/root/.joinmarket-ng` | Wallets, fidelity bonds, TLS material, history |
| `main` | `./store.json` | not mounted | StartOS-generated web UI password |
| `tor` | — | `/var/lib/tor` | Tor consensus cache and control cookie |
| Bitcoin's `main` | — | `/mnt/bitcoind` (read-only) | Bitcoin's RPC cookie |

`store.json` deliberately sits at the root of `main` rather than under `./data`, so the container never sees the generated password on disk — it reaches Jam only as an environment variable.

## Installation and First-Run Flow

Upstream expects the operator to supply the web UI credentials and a Bitcoin RPC endpoint by hand. This package handles both:

1. A **critical task** requires the user to run the **Create Password** action before the service will start. Nothing is seeded at install time, so there is no window in which a default password is live.
2. A **critical task** on Bitcoin requires `prune=0`, because joinmarket-ng rescans from genesis when importing a wallet descriptor.

Bitcoin RPC needs no setup: Bitcoin's data directory is mounted read-only and Jam authenticates with its `.cookie`, so there are no credentials to generate, store, or rotate.

The Bitcoin RPC address is resolved at runtime with `sdk.host.getBridgeAddress` (`ssl: false`, since bitcoind publishes its RPC binding as `protocol: 'http'` and therefore carries both a plaintext and a TLS address). Both the host and the assigned port come from that lookup — neither is hardcoded.

## Configuration Management

| StartOS-Managed | Upstream-Managed |
| --- | --- |
| Web UI credentials (`APP_USER`, `APP_PASSWORD`) | Wallet creation, jars, and all coin control |
| Bitcoin RPC endpoint and cookie path | Maker offer parameters, fee limits |
| Whether the entrypoint waits for Bitcoin | Scheduler and tumbler settings |
| | Everything else in the Jam UI |

StartOS-managed environment variables passed to the container:

- `APP_USER`, `APP_PASSWORD` — nginx basic auth for the web UI
- `BITCOIN__RPC_URL` — resolved from the bridge at runtime
- `BITCOIN__RPC_COOKIE_FILE` — points into the read-only Bitcoin mount
- `WAIT_FOR_BITCOIND` — set to `false`

`WAIT_FOR_BITCOIND` is disabled on purpose. When enabled, the entrypoint polls Bitcoin before starting s6, so no port is open and the service appears dead for as long as Bitcoin is syncing. Leaving it off lets the UI come up, and the declared `sync-progress` dependency health check reports sync state instead.

joinmarket-ng also reads a `config.toml` from its data directory if one exists. This package does not write one, so any file the user places there takes effect as upstream documents.

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose |
| --- | --- | --- | --- |
| `ui` | 80 | HTTP | Jam web interface |

`jmwalletd` (28183) and the orderbook watcher (8000) listen on loopback inside the container and are reached through nginx; they are not exposed as StartOS interfaces.

The web UI is protected by HTTP basic auth inside the container, because Jam's own API is unauthenticated until a wallet is unlocked.

## Actions (StartOS UI)

| Action | Purpose | Visibility | Availability | Output |
| --- | --- | --- | --- | --- |
| **Create Password** / **Reset Password** | Generates a new web UI password | Enabled | Any status | Username and password, password masked and copyable |

The action's name and description change depending on whether a password has been set yet.

## Backups and Restore

`sdk.Backups.ofVolumes('main')` — wallets, fidelity bond registry, transaction history, and the generated web UI password in `store.json`.

The `tor` volume is deliberately excluded: it holds only the Tor consensus cache, which is rebuilt on first start. The watch-only descriptor wallet that joinmarket-ng creates inside Bitcoin's own data directory is likewise not backed up here; it is reconstructed from the Jam wallet.

## Health Checks

| Check | Method | Reports |
| --- | --- | --- |
| **Web Interface** (daemon `ready`) | Port 80 listening | Whether nginx is serving |
| **JoinMarket Daemon** | `curl` against `jmwalletd`'s `/api/v1/session` over loopback TLS | Whether the wallet daemon is answering |

Both checks exist because the image's own startup ordering does not gate on readiness — nginx accepts connections before `jmwalletd` is listening, so port 80 alone would report healthy while the API is still down.

## Dependencies

| Dependency | Required | Health checks | Purpose |
| --- | --- | --- | --- |
| Bitcoin | Yes | `bitcoind`, `sync-progress` | Blockchain data and transaction broadcast over RPC |

Bitcoin's `main` volume is mounted read-only at `/mnt/bitcoind` so Jam can read `.cookie` for RPC auth. joinmarket-ng reads that cookie once when it builds its settings, so `main.ts` watches the file and restarts the daemon when Bitcoin rotates it. The required version range is declared in `startos/dependencies.ts`.

Bitcoin must be archival. Jam issues a full rescan when it imports a wallet descriptor, which a pruned node cannot serve.

## Limitations and Differences

1. **Beta software.** Jam 2.0 and the joinmarket-ng backend are both pre-release and under active development upstream.
2. **This is a separate package from `jam`, not an upgrade of it.** joinmarket-ng uses a different wallet format from joinmarket-clientserver and upstream removed clientserver support entirely, so no migration is possible and the package ships under its own id. A user coming from the older Jam recovers from their seed phrase here.
3. **Pruned Bitcoin nodes are not usable**, and the archival requirement is enforced with a critical task.
4. **The UI login is HTTP basic auth**, not a Jam account. There is one user, `jam`, and only the password can be changed.
5. **No `config.toml` is generated.** Settings outside the environment variables listed above must be set through the Jam UI or by placing a `config.toml` in the data directory.

## What Is Unchanged from Upstream

- Wallet creation, recovery, and seed handling
- Jars, coin control, freezing and unfreezing UTXOs
- Sending collaborative transactions, sweeps, and the scheduler
- The Earn tab, maker offers, and fidelity bonds
- The orderbook view
- Tor connectivity to the JoinMarket directory nodes
- The log viewer and all other in-app features

## Contributing

Build and development workflow follow the StartOS packaging guide: <https://docs.start9.com/packaging>. Keep `README.md`, `instructions.md`, and `AGENTS.md` in sync with any change to user-visible behavior or package structure.

---

## Quick Reference for AI Consumers

```yaml
package_id: jam-v2
architectures: [x86_64, aarch64]
volumes:
  main: /root/.joinmarket-ng # subpath ./data; store.json at volume root, unmounted
  tor: /var/lib/tor
mounted_dependency_volumes:
  bitcoind.main: /mnt/bitcoind # read-only, for .cookie
ports:
  ui: 80
internal_ports:
  jmwalletd: 28183
  obwatcher: 8000
dependencies: [bitcoind]
startos_managed_env_vars:
  - APP_USER
  - APP_PASSWORD
  - BITCOIN__RPC_URL
  - BITCOIN__RPC_COOKIE_FILE
  - WAIT_FOR_BITCOIND
actions:
  - set-password
health_checks:
  - jam # daemon ready: port 80
  - jmwalletd # jmwalletd /api/v1/session
```
