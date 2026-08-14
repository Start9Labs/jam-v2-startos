# Updating Jam

The package pins one image: `ghcr.io/joinmarket-webui/jam-standalone-ng`, in `startos/manifest/index.ts`.

## Reading the tag

Tags are `v<jam>-ng-v<joinmarket-ng>` — e.g. `v2.0.0-beta.2-ng-v0.35.0` is Jam 2.0.0-beta.2 built against joinmarket-ng 0.35.0. **Both halves move independently**, and the StartOS `version` string tracks the Jam half only.

## Finding the next version

The image is built from [joinmarket-webui/jam-docker](https://github.com/joinmarket-webui/jam-docker) (`standalone-ng/`), not from the Jam repo. A Jam release does **not** imply an image, and `jam-docker`'s `master` regularly tracks a newer joinmarket-ng than anything published.

List what actually exists on the registry before picking a tag:

```sh
TOKEN=$(curl -s "https://ghcr.io/token?scope=repository:joinmarket-webui/jam-standalone-ng:pull&service=ghcr.io" | jq -r .token)
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://ghcr.io/v2/joinmarket-webui/jam-standalone-ng/tags/list?n=200" | jq -r '.tags[]'
```

Then confirm the tag you chose resolves for both architectures:

```sh
curl -s -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.oci.image.index.v1+json" \
  "https://ghcr.io/v2/joinmarket-webui/jam-standalone-ng/manifests/<tag>" \
  | jq '[.manifests[].platform]'
```

Ignore the `latest` tag — pin an explicit version.

## Jam 2.x is still prerelease

Every published `jam-standalone-ng` tag so far is a Jam beta. Shipping one is a deliberate decision, not the usual "skip prereleases" default. When upstream cuts a stable `v2.0.0` image, move to it.

## On every bump

- Re-read `standalone-ng/jam-ng-entrypoint.sh` in `jam-docker` for changes to the environment variables this package sets (`APP_USER`, `APP_PASSWORD`, `BITCOIN__RPC_*`, `WAIT_FOR_BITCOIND`).
- Check the joinmarket-ng changelog for new Bitcoin Core requirements, and raise the dependency range in `startos/dependencies.ts` if they changed.
