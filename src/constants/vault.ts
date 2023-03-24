import { NetworkId } from 'types/network';

export enum VaultTab {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

export enum VaultTradeStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    WIN = 'WIN',
    LOSE = 'LOSE',
    CANCELLED = 'CANCELLED',
}

export const VAULT_MAP: Record<string, any> = {
    'discount-vault': {
        addresses: {
            5: '',
            10: '0xc922f4CDe42dD658A7D3EA852caF7Eae47F6cEcd',
            42: '',
            420: '0x3051d3a7e619C161B64dCe0B287688012655bA56',
            42161: '0xfF7AEA98740fA1e2a9eB81680583e62aaFf1e3Ad',
        },
    },
    'degen-discount-vault': {
        addresses: {
            5: '',
            10: '0xBaaC5464BF6E767C9af0E8d4677C01Be2065fd5F',
            42: '',
            420: '',
            42161: '0xA852a651377fbE23f3d3acF5919c3D092aD4b77d',
        },
    },
    'safu-discount-vault': {
        addresses: {
            5: '',
            10: '0x43D19841D818B2ccC63a8B44Ce8C7DEF8616D98E',
            42: '',
            420: '',
            42161: '0xE26374c7aFe71a2a6AB4A61080772547C43B87E6',
        },
    },
    'parlay-discount-vault': {
        addresses: {
            5: '',
            10: '0x8285047F33c26c1Bf5B387f2b07F21A2aF29Ace2',
            42: '',
            420: '0x7e415D74eb5B01531B2059D1901aCe751c6B26B3',
            42161: '0xAb9E5fc491c743AE0b45f7100fAf611Deb8FeC4A',
        },
    },
};

export enum VaultTransaction {
    TRADES_HISTORY = 'trades-hisotry',
    USER_TRANSACTIONS = 'user-transactions',
}

export const isParlayVault = (vaultAddress: string, networkId: NetworkId) => {
    return vaultAddress === VAULT_MAP['parlay-discount-vault'].addresses[networkId];
};
