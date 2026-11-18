import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { i18n } from './i18n'
import { depBitcoind } from './manifest/i18n'
import { sdk } from './sdk'

const bitcoind = sdk.Dependency.required('bitcoind', {
  description: depBitcoind,
  metadata: {
    title: 'Bitcoin',
    icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/master/icon.svg',
  },
  // Per-major floors: each line's first release with the rpc/ mount.
  versionRange:
    '(>=28.4:42 && <29) || (>=29.5:4 && <30) || (>=30.4:4 && <31) || >=31.2:4 || >=#knotsprerdts:29.3:33 || >=#roots:29.4:1',
  kind: 'running',
  healthChecks: ['bitcoind', 'sync-progress'],
}).withInit(async (effects) => {
  // joinmarket-ng keeps its UTXOs in a bitcoind descriptor wallet and rescans
  // from genesis when it imports one, which a pruned node rejects.
  await sdk.action.createTask(effects, 'bitcoind', autoconfig, 'critical', {
    input: {
      kind: 'partial',
      accept: [{ prune: 0, wallet: { enable: true } }],
      set: { prune: 0, wallet: { enable: true } },
    },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n(
      'Jam requires an archival Bitcoin node with its wallet enabled',
    ),
  })
})

export const dependencies = sdk.Dependencies.of().addDependency(bitcoind)
