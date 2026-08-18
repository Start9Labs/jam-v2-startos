# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **Only `main`'s `./data` subpath is mounted, and that is what keeps `store.json` out of the container.** The login password lives at the volume root; mounting the volume root instead would hand it to Jam.
- **`WAIT_FOR_BITCOIND` must stay `false`.** Left at the image's default the entrypoint blocks before binding any port, so the UI is unreachable with no explanation while Bitcoin syncs. The declared `sync-progress` dependency check is what communicates that wait instead.
- **The `jmwalletd` health check is not redundant with the port check.** nginx accepts connections before the wallet daemon is listening, so port 80 alone reports healthy while the API is still down. Keep both.
- **Bitcoin must be archival, and the task on `bitcoind` is how that is enforced** — joinmarket-ng rescans from genesis on wallet-descriptor import, which a pruned node rejects. `when: input-not-matches, once: false` is what makes it re-raise if pruning is turned back on.
- **The bundled Tor daemon is Jam's own**, not the StartOS Tor service, and its volume is deliberately excluded from backups — it holds only the consensus cache.
