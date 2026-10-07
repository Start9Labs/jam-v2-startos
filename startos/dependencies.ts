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
  // Per-major, not one floor: a bare `>=28.4:29` would also admit 29.0 and
  // 30.0, which sort above it but predate the revision those lines need.
  versionRange:
    '(>=28.4:30 && <29) || (>=29.4:17 && <30) || (>=30.3:17 && <31) || >=31.1:19 || >=#knotsprerdts:29.3:29',
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
