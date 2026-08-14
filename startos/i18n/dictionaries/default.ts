export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Jam!': 0,
  'Jam is not set up yet': 1,
  'Web Interface': 2,
  'The web interface is ready': 3,
  'The web interface is not ready': 4,
  'JoinMarket Daemon': 5,
  'The JoinMarket daemon is ready': 6,
  'The JoinMarket daemon is not ready': 19,

  // interfaces.ts
  'Web UI': 7,
  'The web interface of Jam': 8,

  // actions/setPassword.ts
  'Create Password': 9,
  'Reset Password': 10,
  'Create your Jam password': 11,
  'Reset your Jam password': 12,
  Success: 13,
  'Your Jam password has been set. Use the credentials below to log in.': 14,
  Username: 15,
  Password: 16,

  // dependencies.ts
  'Jam requires an archival Bitcoin node': 18,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
