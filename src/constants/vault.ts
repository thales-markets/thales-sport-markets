export enum VaultTab {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

export enum VaultTradeStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    WIN = 'WIN',
    LOSE = 'LOSE',
}

export const VAULT_MAP: Record<string, any> = {
    'discount-vault': {
        addresses: {
            5: '',
            10: '0xc922f4CDe42dD658A7D3EA852caF7Eae47F6cEcd',
            42: '',
            420: '0x3051d3a7e619C161B64dCe0B287688012655bA56',
        },
    },
};
