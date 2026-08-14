# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `jam-v2`.** Wraps upstream's `jam-standalone-ng` image: the Jam web UI plus the `joinmarket-ng` backend, an orderbook watcher, nginx and Tor, all supervised by s6-overlay as root.
- **The id is `jam-v2`, not `jam`, deliberately.** Jam 2.0 replaced its backend: releases up to 0.4.x wrapped `joinmarket-clientserver` via the `jam-standalone` image, upstream removed clientserver support in 2.0, and the wallet formats are mutually unreadable. Since there is no possible upgrade path, this ships as a separate package rather than a new version of `jam` — a StartOS user moving over recovers from their seed. Don't "restore" the `jam` id or add migrations from it.
- **Tor is bundled, deliberately.** There is no `tor` dependency. JoinMarket's maker needs a Tor *control* port to publish its own onion service, and the StartOS Tor service exposes only SOCKS. The `tor` volume persists the consensus cache so restarts don't re-bootstrap.
- **Bitcoin auth is the cookie file, like every other bitcoind dependent.** Bitcoin's `main` volume is mounted read-only at `/mnt/bitcoind` and `BITCOIN__RPC_COOKIE_FILE` points at `.cookie` — matching mempool, electrs, utxoracle and btcpayserver. Don't reintroduce `generate-rpc-dependent`/`rpcauth`: it needs a task that can never re-arm if Bitcoin's entry is later deleted. joinmarket-ng reads the cookie once at settings construction, so `main.ts` watches the file and restarts on rotation (an absent cookie just means bitcoind is down).
- **The RPC address comes from `sdk.host.getBridgeAddress` with `ssl: false`.** bitcoind binds RPC as `protocol: 'http'`, which publishes both a plaintext and a TLS bridge address, so the discriminator is required. Carry both halves of the result — the assigned port is not necessarily 8332, and `<pkg>.startos` DNS is deprecated.
- **`WAIT_FOR_BITCOIND` is set to `false` on purpose.** The upstream entrypoint otherwise polls Bitcoin *before* `exec /init`, so no port is open at all and the daemon looks dead for the whole of a chain sync.
- **Basic auth needs no nginx patching.** Setting `APP_USER`/`APP_PASSWORD` makes the entrypoint enable `auth_basic` on the whole server block. This was measured against the real image: the `/jam/internal/auth` subrequest and the `/jmws` websocket both work with credentials supplied. Do not add seds against `conf.d/default.conf` to "fix" them.
- **Port 80 alone is not readiness.** nginx accepts connections before `jmwalletd` listens, so `main.ts` adds a separate `jmwalletd` health check against `/api/v1/session`.
- **`jmwalletd` exposes no Bitcoin-connectivity signal before a wallet is unlocked.** Measured against the real image: `/api/v1/getinfo` is static, and `/api/v1/session` returns `block_height: null` both when Bitcoin works and when it is unreachable. Don't build a health check on either expecting it to catch a broken RPC — it would be permanently green or permanently red.
- **Defaults that need no env var:** `backend_type` is already `descriptor_wallet` and `network` is already `mainnet` in `jmcore/settings.py`, so the package sets neither.

## Inspecting a running install

To run a command inside the service's container, use `start-cli package attach jam-v2 -n jam-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `jam-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name.

Useful once attached: `curl -k https://127.0.0.1:28183/api/v1/session` (wallet daemon), `curl http://127.0.0.1:8000/health` (orderbook watcher — `directory_nodes > 0` means Tor reached the market), and `/var/log/jam-ng/` for per-service logs.
