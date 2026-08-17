<p align="center">
  <img src="icon.svg" alt="Jam Logo" width="21%">
</p>

# Jam V2 on StartOS

> Everything not listed in this document should behave the same as upstream
> Jam. If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation
> section of `instructions.md` for links.

[Jam](https://github.com/joinmarket-webui/jam) is a web interface for JoinMarket, the CoinJoin implementation. This package runs the standalone image — Jam, JoinMarket, and their own Tor daemon in one container — generates the login credential, and requires an archival Bitcoin node.

- **Upstream repo:** <https://github.com/joinmarket-webui/jam>
- **Wrapper repo:** <https://github.com/Start9Labs/jam-v2-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The upstream standalone image is used unmodified, run as the container's init process because it supervises several processes of its own.

| Property      | Value                                                    |
| ------------- | -------------------------------------------------------- |
| Image         | `ghcr.io/joinmarket-webui/jam-standalone-ng`             |
| Architectures | x86_64, aarch64                                          |
| Entrypoint    | Upstream default, run as init                            |
| Subcontainer  | `jam-sub` — the `jam` daemon, and the one to `attach` to |

Inside that one container the image runs nginx serving the web UI, the JoinMarket wallet daemon behind it, and **its own Tor daemon** — Jam speaks to the JoinMarket peer network over Tor, and does not use the StartOS Tor service.

## Volume and Data Layout

Two volumes, and the split inside `main` is deliberate.

| Volume | Mount Point                       | Purpose                        |
| ------ | --------------------------------- | ------------------------------ |
| `main` | `./data` → `/root/.joinmarket-ng` | JoinMarket's wallets and state |
| `tor`  | `/var/lib/tor`                    | The bundled Tor daemon's state |

**Only the `data` subdirectory of `main` is mounted.** `store.json` sits at the volume root, outside that subpath, so the generated password is never visible to Jam itself.

Bitcoin's data directory is mounted **read-only** at `/mnt/bitcoind`, which is how Jam reads the RPC cookie.

## File Models

One model, holding one value.

| File         | Format | Modelled                | Written by              |
| ------------ | ------ | ----------------------- | ----------------------- |
| `store.json` | JSON   | Yes — `FileHelper.json` | The Set Password action |

`appPassword` is the credential for Jam's basic auth. The username is fixed at `jam`; only the password is generated, and nothing but the action writes it.

**No configuration file reaches the application.** Jam is configured by environment, composed on each start:

| Variable                   | Value                                                |
| -------------------------- | ---------------------------------------------------- |
| `APP_USER`, `APP_PASSWORD` | The fixed username and the generated password        |
| `BITCOIN__RPC_URL`         | Bitcoin's RPC address, resolved from its own binding |
| `BITCOIN__RPC_COOKIE_FILE` | The cookie path inside the read-only mount           |
| `WAIT_FOR_BITCOIND`        | `false` — an override, see below                     |

`WAIT_FOR_BITCOIND` is the one departure from how the image would behave on its own. Left at its default, the entrypoint blocks until Bitcoin is reachable and synced — during which nothing binds a port at all, so the web UI is simply unreachable with no explanation. Switching it off lets the UI come up and report the wait through the declared dependency check instead.

The address is omitted rather than faked while Bitcoin is absent, and the package restarts when Bitcoin writes a **replacement** RPC cookie — but not when the cookie merely disappears, since that means Bitcoin is down. JoinMarket reads the cookie once, when it builds its settings, so a rotation has to restart it.

## Dependencies

One, required, and with a configuration requirement of its own.

| Dependency | Kind      | Health checks               | Mount                      | Why                                     |
| ---------- | --------- | --------------------------- | -------------------------- | --------------------------------------- |
| Bitcoin    | `running` | `bitcoind`, `sync-progress` | `/mnt/bitcoind`, read-only | Chain data over RPC, and the RPC cookie |

**Bitcoin must be archival, and the package raises a `critical` task on Bitcoin saying so** — see [Tasks](#tasks). JoinMarket rescans from genesis when it imports a wallet descriptor, which a pruned node refuses.

Both health checks are required, not just "running": a node still syncing cannot answer the queries JoinMarket makes of it.

## Network Access and Interfaces

One interface. The JoinMarket daemon's own API is loopback-only inside the container and is never published.

| Interface | Id   | Type | Port | Description           |
| --------- | ---- | ---- | ---- | --------------------- |
| Web UI    | `ui` | ui   | 80   | The Jam web interface |

The port is bound on the `ui-multi` MultiHost and is not masked.

## Installation and First-Run Flow

Install generates nothing and starts nothing usable: **the service will not start until a password exists**, because `main` refuses to run without one. A `critical` task asks for it.

Once that is done, two waits remain, neither of which is a fault:

- **Bitcoin's sync**, reported through the dependency check rather than by a stalled service.
- **JoinMarket's own startup**, which the second health check reports separately from the web UI's.

Wallet creation happens inside Jam, after logging in with the username `jam` and the generated password.

## Actions

One action, which renames itself to match what running it will do.

### Create / Reset Password

Generates the password for Jam's basic auth. It is "Create Password" until one exists and "Reset Password" afterwards.

- **What it changes:** `appPassword` in `store.json`.
- **Cost:** seconds, then a restart — the credential is passed as environment.
- **Repeat safety:** safe to re-run; each run generates a fresh password and invalidates the previous one.
- **Outputs:** the fixed username and the new password, masked and copyable. It is not recoverable afterwards.

This is the login for the Jam interface, not for a JoinMarket wallet — wallet passwords are set inside Jam and are not managed here.

## Tasks

Two tasks, and one of them appears on another service's page.

| Task            | Raised on | Severity   | Raised when                       | Cleared when                                            |
| --------------- | --------- | ---------- | --------------------------------- | ------------------------------------------------------- |
| Create Password | this      | `critical` | At init, while no password is set | The action runs                                         |
| Auto-Configure  | Bitcoin   | `critical` | Bitcoin has pruning enabled       | Bitcoin is set to archival; it returns if changed again |

The Bitcoin task is `critical` there, not here, and nothing on Bitcoin's page explains which service asked for it. It carries the setting itself, so accepting it applies the change — but note what that change costs: turning pruning off on a node that was pruned means re-downloading the chain.

## Health Checks

Two checks, and the second exists because the first cannot be trusted alone.

| Check                           | Method                                              |
| ------------------------------- | --------------------------------------------------- |
| `jam` "Web Interface"           | Port 80 is listening                                |
| `jmwalletd` "JoinMarket Daemon" | An authenticated request to the wallet daemon's API |

**nginx accepts connections before the JoinMarket daemon is up**, so the web-interface check reports healthy while the API behind it is still starting — which is exactly the window where the interface loads but nothing in it works. The second check probes the daemon directly and is the one to read when Jam is reachable but unresponsive.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. No dump step and nothing excluded.

- **Included:** JoinMarket's wallets and state, and `store.json` with the login password.
- **Excluded:** the `tor` volume, which holds only the bundled Tor daemon's consensus cache and is rebuilt on its own.
- **Restore:** complete. The password comes back with the backup, so no task is raised. Bitcoin must be present, archival, and synced before Jam is usable again.

## Limitations and Differences

1. **Bitcoin must be archival.** JoinMarket rescans from genesis on wallet import, which a pruned node refuses — hence the task on Bitcoin.
2. **The service will not start without a password**, by design rather than defaulting to one.
3. **Jam runs its own Tor daemon** rather than using the StartOS Tor service, and its state is not backed up.
4. **The login username is fixed at `jam`.** Only the password is configurable, and only by regenerating it.
5. **The web UI can be up before JoinMarket is.** Read the second health check, not the first.
6. **No riscv64 build.** x86_64 and aarch64 only.

---

## Quick Reference for AI Consumers

```yaml
package_id: jam-v2
image: ghcr.io/joinmarket-webui/jam-standalone-ng
architectures:
  - x86_64
  - aarch64
subcontainers:
  - jam-sub
volumes:
  main: ./data → /root/.joinmarket-ng (store.json sits at the volume root, unmounted)
  tor: /var/lib/tor
file_models:
  - store.json
startos_managed_env_vars:
  - APP_USER
  - APP_PASSWORD
  - WAIT_FOR_BITCOIND
  - BITCOIN__RPC_URL
  - BITCOIN__RPC_COOKIE_FILE
dependencies:
  - bitcoind # required, archival; mounted read-only at /mnt/bitcoind
interfaces:
  ui: { type: ui, port: 80 }
actions:
  - set-password # renames itself to "Create Password" when unset
tasks:
  - { action: set-password, severity: critical }
  - { action: autoconfig, severity: critical } # on bitcoind: pruning off
health_checks:
  - jam # displayed "Web Interface"
  - jmwalletd # displayed "JoinMarket Daemon"
```
