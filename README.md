# Thales: Sport Positional Markets

[![Discord](https://img.shields.io/discord/906484044915687464.svg?color=768AD4&label=discord&logo=https%3A%2F%2Fdiscordapp.com%2Fassets%2F8c9701b98ad4372b58f13fd9f65f966e.svg)](https://discord.com/invite/rB3AWKwACM)
[![Twitter Follow](https://img.shields.io/twitter/follow/OvertimeMarkets?style=social)](https://twitter.com/OvertimeMarkets)

Thales: Sport Positional Markets.

The UI is available on [overtimemarkets.xyz](https://overtimemarkets.xyz).

## Tech stack

-   React
-   React Redux
-   React Query
-   react-i18next
-   styled-components
-   Recharts

## Ethereum stack

-   `ethers.js` v5 - Ethereum wallet implementation.
-   `RainbowKit` and `wagmi` - for ethereum wallet connectivity.
-   [thales-data](https://github.com/thales-markets/thales-data) - for historical data (powered by [TheGraph](https://thegraph.com/))

## Development

### Install dependencies

```bash
npm i
```

### Set up environment variables

Copy the `.env.local.example` file in this directory to `.env.local` (which will be ignored by Git):
Then, open `.env.local` and add the missing environment variables:

-   `VITE_APP_IPFS_DEPLOYMENT` - Is dApp in the mode for deployment on IPFS. Set to `false`.
-   `VITE_APP_INFURA_PROJECT_ID` - Infura project id (get it from [infura.io](https://infura.io/)).
-   `VITE_APP_WALLET_CONNECT_PROJECT_ID` - WalletConnect project id (get it from [WalletConnect Cloud](https://cloud.walletconnect.com/)).

### Set up Google Translate API

This step is needed only if you wish to contribute to the project.

On every commit a pre-commit hook is triggered to translate missing values from the en.json located in src/i18n.

In order for this to work a Google Cloud account is needed and a system environment variable needs to be set pointing
to a locally stored json provided by Google.

Full Guide: https://github.com/googleapis/nodejs-translate#before-you-begin

The translation script is located in check_translations.js.example. Create a new file called check_translations.js identical to check_translations.js.example and set the projectId variable to the project id provided by Google.

### Run

```bash
npm run start
```

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!
