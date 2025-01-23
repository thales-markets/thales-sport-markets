export type SgpParams = {
    gameId: string;
    marketNames: string[];
    typeIds: number[];
    lines: number[];
    playerIds: number[];
};

export type SgpQuoteData = {
    gameId: string;
    market: string;
    name: string;
    price: number;
};

export type SportsbookData = {
    error: string | null;
    missingEntries: SgpQuoteData[] | null;
    legs: SgpQuoteData[] | null;
    price: number | null;
    priceWithSpread: number | null;
};

export type SgpData = {
    data: Record<string, SportsbookData>;
};
