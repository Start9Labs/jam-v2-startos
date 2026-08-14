import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.0.0-beta.2:0',
  releaseNotes: {
    en_US:
      'Jam 2.0, built on the new joinmarket-ng backend. This is beta software — use with caution. It installs alongside an older Jam rather than upgrading it; recover your wallet here from its seed phrase.',
    es_ES:
      'Jam 2.0, basado en el nuevo backend joinmarket-ng. Este es software beta: úsalo con precaución. Se instala junto a un Jam anterior en lugar de actualizarlo; recupera aquí tu monedero con su frase semilla.',
    de_DE:
      'Jam 2.0, basierend auf dem neuen joinmarket-ng-Backend. Dies ist Beta-Software – mit Vorsicht verwenden. Es wird neben einem älteren Jam installiert und aktualisiert dieses nicht; stelle deine Wallet hier mit ihrer Seed-Phrase wieder her.',
    pl_PL:
      'Jam 2.0, oparty na nowym backendzie joinmarket-ng. To oprogramowanie w wersji beta – używaj ostrożnie. Instaluje się obok starszego Jam, zamiast go aktualizować; odzyskaj tutaj swój portfel z frazy seed.',
    fr_FR:
      "Jam 2.0, basé sur le nouveau backend joinmarket-ng. Ce logiciel est en version bêta : à utiliser avec prudence. Il s'installe à côté d'un Jam plus ancien au lieu de le mettre à jour ; restaurez ici votre portefeuille à partir de sa phrase de récupération.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
