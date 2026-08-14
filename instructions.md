# Jam

Jam runs CoinJoins against a live market of other traders. Your wallet seed is created inside Jam and is the only way to recover your funds — write it down when Jam shows it to you.

## Documentation

- [Jam documentation](https://jamdocs.org/) — the upstream user guide, including the FAQ and a walkthrough of the sending and earning flows.

## What you get on StartOS

- A **Web UI** for JoinMarket: create a wallet, send collaborative transactions, and earn by offering liquidity to other traders.
- Tor runs inside Jam, so there is nothing separate to install or configure for market connectivity.
- Your wallet files, fidelity bonds, and transaction history live on this server and are covered by StartOS backups.

## Getting set up

1. **Install Bitcoin first.** Jam reads the blockchain and broadcasts transactions through it, and will not start until Bitcoin is installed and running.
2. **Leave Bitcoin archival.** Jam scans the whole chain when it imports a wallet, which a pruned node cannot serve. StartOS will prompt you to turn pruning off if it is on — expect to need roughly 1 TB of free disk for the Bitcoin node.
3. **Run the Create Password task.** StartOS asks you for this before Jam will start. It generates the password for the Jam web interface and shows it to you once — copy it somewhere safe. Jam connects to Bitcoin on its own, so there are no RPC credentials to set up.
4. **Open the Web UI** and log in with the username `jam` and the password from step 3.
5. **Create or recover a wallet.** Jam will show you a seed phrase — write it down and store it offline. Recovering an existing JoinMarket wallet works here too.

After the wallet is created, Jam imports it into Bitcoin and rescans the chain. This can take anywhere from minutes to several hours before your balance appears; the interface will tell you it is rescanning.

## Using Jam

### Web interface

Logging in lands you on your wallet. From here you can send a collaborative transaction, receive to a fresh address, and move funds between jars.

### Earning

The **Earn** tab offers your coins as liquidity to other traders and pays you a fee when someone uses them. Jam publishes an onion service over its own Tor daemon so other participants can reach you; leaving the service running is what keeps you earning.

### Sending

The **Send** tab performs a collaborative transaction. You choose the number of counterparties and the amount, and Jam pays them a small fee to join your transaction and break the link to your coins' history.

### Actions

- **Create Password / Reset Password** — generates a new password for the web interface and shows it to you. Run it if you lose the password or want to rotate it.

## Limitations

- **This is beta software.** Jam 2.0 and its JoinMarket backend are both new and under active development. Do not put more into it than you are willing to lose.
- **This does not upgrade an older Jam install.** Jam 2.0 uses a different backend with an incompatible wallet format, so it installs alongside the old one rather than replacing it. If you were running an older Jam, recover your wallet here from its seed phrase, and confirm your balance before removing the old service.
