export type Token = {
    address: string;
    decimals: number;
    symbol: string;
    name: string;
    logoURI: string;
};

export type OvertimeVoucher = {
    address: string;
    id: number;
    remainingAmount: number;
};

export type OvertimeVouchers = OvertimeVoucher[];
