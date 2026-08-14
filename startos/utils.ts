import { utils } from '@start9labs/start-sdk'

/** nginx inside the image serves the web UI here. */
export const uiPort = 80
/** jmwalletd's HTTPS API, loopback-only inside the container. */
export const jmwalletdPort = 28183

/** The username Jam's basic auth expects. Fixed; only the password is generated. */
export const appUser = 'jam'

export const dataDir = '/root/.joinmarket-ng'
export const torDir = '/var/lib/tor'
export const bitcoindMountpoint = '/mnt/bitcoind'
export const cookiePath = `${bitcoindMountpoint}/.cookie`

export function randomPassword() {
  return utils.getDefaultString({ charset: 'a-z,A-Z,1-9', len: 32 })
}
