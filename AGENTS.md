# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Only `main`'s `./data` subpath is mounted, and that is what keeps `store.json` out of the container.** The login password lives at the volume root; mounting the volume root instead would hand it to Jam.
- **`WAIT_FOR_BITCOIND` must stay `false`.** Left at the image's default the entrypoint blocks before binding any port, so the UI is unreachable with no explanation while Bitcoin syncs. The declared `sync-progress` dependency check is what communicates that wait instead.
- **The `jmwalletd` health check is not redundant with the port check.** nginx accepts connections before the wallet daemon is listening, so port 80 alone reports healthy while the API is still down. Keep both.
- **Bitcoin must be archival, and the task on `bitcoind` is how that is enforced** — joinmarket-ng rescans from genesis on wallet-descriptor import, which a pruned node rejects. `when: input-not-matches, once: false` is what makes it re-raise if pruning is turned back on.
- **The bundled Tor daemon is Jam's own**, not the StartOS Tor service, and its volume is deliberately excluded from backups — it holds only the consensus cache.
