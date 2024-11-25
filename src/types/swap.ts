import { Address } from 'viem';

export type SwapParams = {
    src: Address; // Source token address
    dst: Address; // Destination token address
    amount: string; // Amount of token to swap (in wei e.g. 100000000000000000)
    from: Address; // Wallet address
    slippage: number; // Maximum acceptable slippage percentage for the swap (e.g., 1 for 1%)
    disableEstimate: boolean; // Set to true to disable estimation of swap details
    allowPartialFill: boolean; // Set to true to allow partial filling of the swap order
    referrer?: string; // Referrer's address
};
