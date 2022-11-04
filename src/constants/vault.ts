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
            10: '',
            42: '',
            420: '0x28aC7A6DeF3D937129ac7245354E11ce89194FbB',
        },
    },
};
