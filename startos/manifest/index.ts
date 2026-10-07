import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

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
          'ghcr.io/joinmarket-webui/jam-standalone-ng:v2.0.0-beta.4-ng-v0.40.0',
      },
      arch: ['x86_64', 'aarch64'],
      emulateMissing: false,
    },
  },
})
