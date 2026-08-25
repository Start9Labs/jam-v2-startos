import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2.0.0-beta.3:0',
  releaseNotes: {
    en_US:
      'Jam 2.0.0-beta.3 on the joinmarket-ng 0.37.1 backend: the wallet has a transaction history, Send and Sweep check the orderbook before they start, the local orderbook shows the status of your own offers, maker offers are grouped into fee quantization bands, the login page has a language selector, and wallet syncs are faster.\n\nJam 2.0 is beta software — use with caution. It installs alongside an older Jam rather than upgrading it; recover your wallet here from its seed phrase.',
    es_ES:
      'Jam 2.0.0-beta.3 sobre el backend joinmarket-ng 0.37.1: el monedero tiene un historial de transacciones, Enviar y Barrer comprueban el libro de órdenes antes de empezar, el libro de órdenes local muestra el estado de tus propias ofertas, las ofertas de los makers se agrupan en bandas de cuantización de comisiones, la pantalla de inicio de sesión tiene un selector de idioma y las sincronizaciones del monedero son más rápidas.\n\nJam 2.0 es software beta: úsalo con precaución. Se instala junto a un Jam anterior en lugar de actualizarlo; recupera aquí tu monedero con su frase semilla.',
    de_DE:
      'Jam 2.0.0-beta.3 auf dem joinmarket-ng-Backend 0.37.1: Die Wallet hat einen Transaktionsverlauf, Senden und Sweep prüfen vorab das Orderbuch, das lokale Orderbuch zeigt den Status der eigenen Angebote, Maker-Angebote werden in Gebühren-Quantisierungsbänder gruppiert, die Anmeldeseite hat eine Sprachauswahl, und Wallet-Synchronisierungen sind schneller.\n\nJam 2.0 ist Beta-Software – mit Vorsicht verwenden. Es wird neben einem älteren Jam installiert und aktualisiert dieses nicht; stelle deine Wallet hier mit ihrer Seed-Phrase wieder her.',
    pl_PL:
      'Jam 2.0.0-beta.3 na backendzie joinmarket-ng 0.37.1: portfel ma historię transakcji, Wyślij i Zamiataj sprawdzają księgę zleceń przed startem, lokalna księga zleceń pokazuje status własnych ofert, oferty makerów są grupowane w pasma kwantyzacji opłat, ekran logowania ma wybór języka, a synchronizacja portfela jest szybsza.\n\nJam 2.0 to oprogramowanie w wersji beta – używaj ostrożnie. Instaluje się obok starszego Jam, zamiast go aktualizować; odzyskaj tutaj swój portfel z frazy seed.',
    fr_FR:
      "Jam 2.0.0-beta.3 sur le backend joinmarket-ng 0.37.1 : le portefeuille dispose d'un historique des transactions, Envoyer et Balayer vérifient le carnet d'ordres avant de démarrer, le carnet d'ordres local affiche l'état de vos propres offres, les offres des makers sont regroupées en bandes de quantification des frais, la page de connexion propose un sélecteur de langue et les synchronisations du portefeuille sont plus rapides.\n\nJam 2.0 est en version bêta : à utiliser avec prudence. Il s'installe à côté d'un Jam plus ancien au lieu de le mettre à jour ; restaurez ici votre portefeuille à partir de sa phrase de récupération.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
