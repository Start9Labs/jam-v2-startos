import { FileHelper } from '@start9labs/start-sdk'
import { manifest as bitcoindManifest } from 'bitcoin-core-startos/startos/manifest'
import { rpcHostId, rpcPort } from 'bitcoin-core-startos/startos/utils'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  appUser,
  bitcoindMountpoint,
  cookiePath,
  dataDir,
  jmwalletdPort,
  torDir,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Jam!'))

  const appPassword = await storeJson.read((s) => s.appPassword).const(effects)
  if (!appPassword) throw new Error(i18n('Jam is not set up yet'))

  // bitcoind binds RPC as `protocol: 'http'`, which publishes both a plaintext
  // and a TLS bridge address; `ssl: false` picks the one we speak.
  const rpcAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: rpcHostId,
      internalPort: rpcPort,
      ssl: false,
    })
    .const()

  const jamSub = sdk.SubContainer.of(
    effects,
    { imageId: 'jam' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'main',
        subpath: './data',
        mountpoint: dataDir,
        readonly: false,
      })
      .mountVolume({
        volumeId: 'tor',
        subpath: null,
        mountpoint: torDir,
        readonly: false,
      })
      .mountDependency<typeof bitcoindManifest>({
        dependencyId: 'bitcoind',
        volumeId: 'main',
        subpath: null,
        mountpoint: bitcoindMountpoint,
        readonly: true,
      }),
    'jam-sub',
  )

  // joinmarket-ng reads the cookie once, when it builds its settings, so a
  // rotation has to restart it. An absent cookie means bitcoind is down.
  const rootfs = await jamSub.rootfs
  await FileHelper.string(`${rootfs}${cookiePath}`)
    .read(
      (cookie) => cookie,
      (prev, next) => next === null || prev === next,
    )
    .const(effects)

  return sdk.Daemons.of(effects)
    .addDaemon('jam', {
      subcontainer: jamSub,
      exec: {
        command: sdk.useEntrypoint(),
        runAsInit: true,
        env: {
          APP_USER: appUser,
          APP_PASSWORD: appPassword,
          // Letting the entrypoint block on bitcoind would leave no port open
          // at all, so the UI would be unreachable while Bitcoin syncs. The
          // declared sync-progress dependency check carries that message.
          WAIT_FOR_BITCOIND: 'false',
          ...(rpcAddress ? { BITCOIN__RPC_URL: `http://${rpcAddress}` } : {}),
          BITCOIN__RPC_COOKIE_FILE: cookiePath,
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: [],
    })
    .addHealthCheck('jmwalletd', {
      // nginx accepts connections before jmwalletd is listening, so port 80
      // alone reports healthy while the API is still down.
      ready: {
        display: i18n('JoinMarket Daemon'),
        fn: () =>
          sdk.healthCheck.runHealthScript(
            [
              'curl',
              '-fsSk',
              '-o',
              '/dev/null',
              `https://127.0.0.1:${jmwalletdPort}/api/v1/session`,
            ],
            jamSub,
            {
              message: () => i18n('The JoinMarket daemon is ready'),
              errorMessage: i18n('The JoinMarket daemon is not ready'),
            },
          ),
      },
      requires: ['jam'],
    })
})
