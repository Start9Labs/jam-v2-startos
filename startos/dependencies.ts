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
  // Per-major, not one floor: a bare `>=28.4:17` would also admit 29.0 and
  // 30.0, which sort above it but predate the revision those lines need.
  versionRange:
    '(>=28.4:17 && <29) || (>=29.4:4 && <30) || (>=30.3:4 && <31) || >=31.1:4',
  kind: 'running',
  healthChecks: ['bitcoind', 'sync-progress'],
}).withInit(async (effects) => {
  // joinmarket-ng rescans from genesis when it imports a wallet descriptor,
  // which a pruned node rejects.
  await sdk.action.createTask(effects, 'bitcoind', autoconfig, 'critical', {
    input: {
      kind: 'partial',
      accept: [{ prune: 0 }],
      set: { prune: 0 },
    },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('Jam requires an archival Bitcoin node'),
  })
})

export const dependencies = sdk.Dependencies.of().addDependency(bitcoind)
