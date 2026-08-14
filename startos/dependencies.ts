import { autoconfig } from 'bitcoin-core-startos/startos/actions/config/autoconfig'
import { i18n } from './i18n'
import { sdk } from './sdk'

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
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

  return {
    bitcoind: {
      kind: 'running',
      // joinmarket-ng states Bitcoin Core v30+; it gates on no version itself,
      // but nothing upstream claims support below that.
      versionRange: '(>=30.3:8 && <31) || >=31.1:8',
      healthChecks: ['bitcoind', 'sync-progress'],
    },
  }
})
