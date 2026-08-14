import { sdk } from './sdk'

// `tor` is excluded deliberately — it holds only the consensus cache.
export const { createBackup, restoreInit } = sdk.setupBackups(
  async ({ effects }) => sdk.Backups.ofVolumes('main'),
)
