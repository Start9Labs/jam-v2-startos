import { setupManifest } from '@start9labs/start-sdk'
import { depBitcoind, long, short } from './i18n'

export const manifest = setupManifest({
  id: 'jam-v2',
  title: 'Jam V2',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9Labs/jam-v2-startos',
  upstreamRepo: 'https://github.com/joinmarket-webui/jam',
  marketingUrl: 'https://jamapp.org',
  donationUrl: null,
  description: { short, long },
  volumes: ['main', 'tor'],
  images: {
    jam: {
      source: {
        dockerTag:
          'ghcr.io/joinmarket-webui/jam-standalone-ng:v2.0.0-beta.3-ng-v0.37.1',
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  dependencies: {
    bitcoind: {
      description: depBitcoind,
      optional: false,
      metadata: {
        title: 'Bitcoin',
        icon: 'https://raw.githubusercontent.com/Start9Labs/bitcoin-core-startos/master/icon.svg',
      },
    },
  },
})
