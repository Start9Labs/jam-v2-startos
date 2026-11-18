import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.0.0-beta.4:1',
  releaseNotes: {
    en_US:
      "Update Bitcoin first: Jam V2 can now read only Bitcoin's RPC credential, not its data directory or wallets.",
    es_ES:
      'Actualiza Bitcoin primero: Jam V2 ahora solo puede leer la credencial RPC de Bitcoin, no su directorio de datos ni sus billeteras.',
    de_DE:
      'Aktualisiere zuerst Bitcoin: Jam V2 kann jetzt nur noch die RPC-Zugangsdaten von Bitcoin lesen, nicht sein Datenverzeichnis oder seine Wallets.',
    pl_PL:
      'Najpierw zaktualizuj Bitcoin: Jam V2 może teraz odczytać tylko poświadczenie RPC Bitcoina, a nie jego katalog danych ani portfele.',
    fr_FR:
      "Mettez d'abord Bitcoin à jour : Jam V2 ne peut désormais lire que l'identifiant RPC de Bitcoin, et non son répertoire de données ni ses portefeuilles.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
