import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.0.0-beta.2:1',
  releaseNotes: {
    en_US:
      'Jam now installs against Bitcoin 28.x and 29.x as well as 30.x and 31.x. The dependency previously named only the two newest lines, so a server running an older Bitcoin could not install it at all.\n\nJam 2.0, built on the new joinmarket-ng backend. This is beta software — use with caution. It installs alongside an older Jam rather than upgrading it; recover your wallet here from its seed phrase.',
    es_ES:
      'Jam ahora se instala con Bitcoin 28.x y 29.x, además de 30.x y 31.x. La dependencia antes solo nombraba las dos líneas más recientes, así que un servidor con un Bitcoin anterior no podía instalarlo.\n\nJam 2.0, basado en el nuevo backend joinmarket-ng. Este es software beta: úsalo con precaución. Se instala junto a un Jam anterior en lugar de actualizarlo; recupera aquí tu monedero con su frase semilla.',
    de_DE:
      'Jam lässt sich jetzt auch mit Bitcoin 28.x und 29.x installieren, nicht nur mit 30.x und 31.x. Die Abhängigkeit nannte zuvor nur die beiden neuesten Linien, sodass ein Server mit älterem Bitcoin es gar nicht installieren konnte.\n\nJam 2.0, basierend auf dem neuen joinmarket-ng-Backend. Dies ist Beta-Software – mit Vorsicht verwenden. Es wird neben einem älteren Jam installiert und aktualisiert dieses nicht; stelle deine Wallet hier mit ihrer Seed-Phrase wieder her.',
    pl_PL:
      'Jam instaluje się teraz również z Bitcoinem 28.x i 29.x, a nie tylko 30.x i 31.x. Zależność wskazywała wcześniej wyłącznie dwie najnowsze linie, więc serwer ze starszym Bitcoinem w ogóle nie mógł go zainstalować.\n\nJam 2.0, oparty na nowym backendzie joinmarket-ng. To oprogramowanie w wersji beta – używaj ostrożnie. Instaluje się obok starszego Jam, zamiast go aktualizować; odzyskaj tutaj swój portfel z frazy seed.',
    fr_FR:
      "Jam s'installe désormais avec Bitcoin 28.x et 29.x, en plus de 30.x et 31.x. La dépendance ne nommait auparavant que les deux lignes les plus récentes : un serveur exécutant un Bitcoin plus ancien ne pouvait pas l'installer.\n\nJam 2.0, basé sur le nouveau backend joinmarket-ng. Ce logiciel est en version bêta : à utiliser avec prudence. Il s'installe à côté d'un Jam plus ancien au lieu de le mettre à jour ; restaurez ici votre portefeuille à partir de sa phrase de récupération.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
