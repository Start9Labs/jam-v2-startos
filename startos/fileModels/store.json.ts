import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const shape = z.object({
  appPassword: z.string().optional().catch(undefined),
})

/**
 * Lives at the root of `main`, outside the `./data` subpath mounted into the
 * container, so the password is never visible to Jam itself.
 */
export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: './store.json' },
  shape,
)
