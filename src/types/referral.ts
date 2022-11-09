export type Referrer = {
    id: string;
    trades: number;
    totalVolume: number;
    totalEarned: number;
    timestamp: number;
};

export type ReferralTransaction = {
    id: string;
    referrer: {
        id: string;
    };
    trader: {
        id: string;
    };
    amount: number;
    volume: number;
    ammType: 'single' | 'parlay';
    timestamp: number;
};

export type ReferredTrader = {
    id: string;
    trades: number;
    totalVolume: number;
    totalAmount: number;
    referrer: {
        id: string;
    };
    timestamp: number;
};
