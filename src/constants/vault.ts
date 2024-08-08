import { Network } from 'enums/network';

export const VAULT_MAP: Record<string, any> = {
    'discount-vault': {
        addresses: {
            [Network.OptimismMainnet]: '0xc922f4CDe42dD658A7D3EA852caF7Eae47F6cEcd',
            [Network.OptimismGoerli]: '0x3051d3a7e619C161B64dCe0B287688012655bA56',
            [Network.Arbitrum]: '0xfF7AEA98740fA1e2a9eB81680583e62aaFf1e3Ad',
        },
    },
    'degen-discount-vault': {
        addresses: {
            [Network.OptimismMainnet]: '0xBaaC5464BF6E767C9af0E8d4677C01Be2065fd5F',
            [Network.OptimismGoerli]: '',
            [Network.Arbitrum]: '0xA852a651377fbE23f3d3acF5919c3D092aD4b77d',
        },
    },
    'safu-discount-vault': {
        addresses: {
            [Network.OptimismMainnet]: '0x43D19841D818B2ccC63a8B44Ce8C7DEF8616D98E',
            [Network.OptimismGoerli]: '',
            [Network.Arbitrum]: '0xE26374c7aFe71a2a6AB4A61080772547C43B87E6',
        },
    },
    'upsettoor-vault': {
        addresses: {
            [Network.OptimismMainnet]: '0x5e2b49c68f1fD68AF1354c377eaceC2f05632D3F',
            [Network.OptimismGoerli]: '',
            [Network.Arbitrum]: '0x31c2947c86412A5e33794105aA034DD9312eb711',
        },
    },
    'parlay-discount-vault': {
        addresses: {
            [Network.OptimismMainnet]: '0x8285047F33c26c1Bf5B387f2b07F21A2aF29Ace2',
            [Network.OptimismGoerli]: '0x7e415D74eb5B01531B2059D1901aCe751c6B26B3',
            [Network.Arbitrum]: '0xAb9E5fc491c743AE0b45f7100fAf611Deb8FeC4A',
        },
    },
};

export const DEPRECATED_VAULTS: string[] = [
    'parlay-discount-vault',
    'upsettoor-vault',
    'discount-vault',
    'degen-discount-vault',
    'safu-discount-vault',
];

export const isParlayVault = (vaultAddress: string, networkId: Network) => {
    return vaultAddress === VAULT_MAP['parlay-discount-vault'].addresses[networkId];
};
