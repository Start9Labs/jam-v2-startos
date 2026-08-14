import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { appUser, randomPassword } from '../utils'

export const setPassword = sdk.Action.withoutInput(
  // id
  'set-password',

  // metadata
  async ({ effects }) => {
    const hasPassword = await storeJson
      .read((s) => !!s.appPassword)
      .const(effects)

    return {
      name: hasPassword ? i18n('Reset Password') : i18n('Create Password'),
      description: hasPassword
        ? i18n('Reset your Jam password')
        : i18n('Create your Jam password'),
      warning: null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  // execution function
  async ({ effects }) => {
    const appPassword = randomPassword()

    await storeJson.merge(effects, { appPassword })

    return {
      version: '1',
      title: i18n('Success'),
      message: i18n(
        'Your Jam password has been set. Use the credentials below to log in.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: appUser,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: appPassword,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
