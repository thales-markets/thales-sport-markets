import { NetworkId } from 'utils/network';

interface RequestArguments {
    method: string;
    params?: unknown[] | Record<string, unknown>;
}

declare global {
    interface Window {
        web3?: {
            eth?: {
                net: {
                    getId: () => NetworkId;
                };
            };
            version: {
                getNetwork(cb: (err: Error | undefined, networkId: string) => void): void;
                network: NetworkId;
            };
        };
        ethereum?: {
            on: (event: string, cb: () => void) => void;
            networkVersion: NetworkId;
            request: (args: RequestArguments) => Promise<unknown>;
            isMetaMask: boolean;
        };
    }
}
