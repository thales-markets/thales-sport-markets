import { EVMProvider } from '@particle-network/authkit';
import { ChainNotConfiguredError, ConnectParameters, createConnector } from '@wagmi/core';
import {
    EIP1193Provider,
    ProviderRpcErrorType,
    SwitchChainError,
    UserRejectedRequestError,
    getAddress,
    numberToHex,
} from 'viem';

particleWagmiWallet.type = 'particleWallet' as const;
export function particleWagmiWallet(param: ConnectParameters & { socialType: string; id: string }) {
    type Provider = EIP1193Provider;
    type Properties = any;

    return createConnector<Provider, Properties>((config) => {
        return {
            id: param.id,
            name: 'Particle Wallet',
            type: param.socialType,
            async connect({ chainId }: { chainId: number }) {
                try {
                    const provider = await this.getProvider();
                    const accounts = (await (provider as EVMProvider).connect(param as any)).map((x) => getAddress(x));

                    provider.on('accountsChanged', this.onAccountsChanged);
                    provider.on('chainChanged', this.onChainChanged);
                    provider.on('disconnect', this.onDisconnect.bind(this));

                    // Switch to chain if provided
                    let currentChainId = await this.getChainId();
                    if (chainId && currentChainId !== chainId) {
                        const chain = await this.switchChain!({ chainId }).catch((error: any) => {
                            if (error.code === UserRejectedRequestError.code) throw error;
                            return { id: currentChainId };
                        });
                        currentChainId = chain?.id ?? currentChainId;
                    }

                    return { accounts, chainId: currentChainId };
                } catch (error: any) {
                    if (error.code == 4011) throw new UserRejectedRequestError(error as Error);
                    throw error;
                }
            },
            async disconnect() {
                const provider = await this.getProvider();

                provider.removeListener('accountsChanged', this.onAccountsChanged);
                provider.removeListener('chainChanged', this.onChainChanged);
                provider.removeListener('disconnect', this.onDisconnect.bind(this));

                await (provider as any)?.disconnect?.();
            },
            async getAccounts() {
                const provider = await this.getProvider();
                return (
                    await provider.request({
                        method: 'eth_accounts',
                    })
                ).map((x: string) => getAddress(x));
            },
            async getChainId() {
                const provider = await this.getProvider();
                const chainId = await provider.request({ method: 'eth_chainId' });
                return Number(chainId);
            },
            async getProvider() {
                if (typeof window === 'undefined') {
                    return;
                }

                while (!(window as any).particle?.ethereum) {
                    await new Promise((resolve) => setTimeout(() => resolve(true), 100));
                }
                return (window as any).particle?.ethereum;
            },
            async isAuthorized() {
                try {
                    const provider = await this.getProvider();
                    return (provider as any).isConnected();
                } catch {
                    return false;
                }
            },
            async switchChain({ chainId }: { chainId: number }) {
                const chain = config.chains.find((chain) => chain.id === chainId);
                if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

                const provider = await this.getProvider();
                const chainId_ = numberToHex(chain.id);

                try {
                    await provider.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: chainId_ }],
                    });
                    return chain;
                } catch (error) {
                    // Indicates chain is not added to provider
                    if ((error as ProviderRpcErrorType).code === 4902) {
                        try {
                            await provider.request({
                                method: 'wallet_addEthereumChain',
                                params: [
                                    {
                                        chainId: chainId_,
                                        chainName: chain.name,
                                        nativeCurrency: chain.nativeCurrency,
                                        rpcUrls: [chain.rpcUrls.default?.http[0] ?? ''],
                                        blockExplorerUrls: [chain.blockExplorers?.default.url],
                                    },
                                ],
                            });
                            return chain;
                        } catch (error) {
                            throw new UserRejectedRequestError(error as Error);
                        }
                    }

                    throw new SwitchChainError(error as Error);
                }
            },
            onAccountsChanged(accounts: string[]) {
                if (accounts.length === 0) config.emitter.emit('disconnect');
                else
                    config.emitter.emit('change', {
                        accounts: accounts.map((x) => getAddress(x)),
                    });
            },
            onChainChanged(chain: string) {
                const chainId = Number(chain);
                config.emitter.emit('change', { chainId });
            },
            async onDisconnect(_error: any) {
                _error && console.log(_error);
                config.emitter.emit('disconnect');

                const provider = await this.getProvider();
                provider.removeListener('accountsChanged', this.onAccountsChanged);
                provider.removeListener('chainChanged', this.onChainChanged);
                provider.removeListener('disconnect', this.onDisconnect.bind(this));
            },
        };
    });
}
