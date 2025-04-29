import { createSmartAccountClient } from '@biconomy/account';
import { IAssetsResponse, UniversalAccount } from '@GDdark/universal-account';
import { LINKS } from 'constants/links';
import { useEffect, useState } from 'react';
import { useAccount, useChainId, useDisconnect, useWalletClient } from 'wagmi';
import biconomyConnector from './biconomyWallet';

// Singleton state outside the hook
let smartAddressSingleton = '';
let universalAddressSingleton = '';
let universalSolanaAddressSingleton = '';
let universalBalanceSingleton: IAssetsResponse | undefined;
let initialized = false;

function useBiconomy() {
    const [, forceUpdate] = useState({});
    const networkId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { disconnect } = useDisconnect();
    const { isConnected } = useAccount();

    useEffect(() => {
        if (isConnected) {
            const bundlerUrl = `${LINKS.Biconomy.Bundler}${networkId}/${import.meta.env.VITE_APP_BICONOMY_BUNDLE_KEY}`;

            const createSmartAccount = async () => {
                const PAYMASTER_API_KEY = import.meta.env['VITE_APP_PAYMASTER_KEY_' + networkId];
                const smartAccount = await createSmartAccountClient({
                    signer: walletClient as any,
                    bundlerUrl: bundlerUrl,
                    biconomyPaymasterApiKey: PAYMASTER_API_KEY,
                });

                const [smartAddressNew] = await Promise.all([smartAccount.getAccountAddress()]);

                if (!initialized) {
                    smartAddressSingleton = smartAddressNew;
                    initialized = true;

                    biconomyConnector.setWallet(smartAccount, smartAddressNew);
                    forceUpdate({}); // Trigger re-render
                }
            };

            if (walletClient) createSmartAccount();
        } else if (initialized) {
            biconomyConnector.resetWallet();
            smartAddressSingleton = '';
            universalAddressSingleton = '';
            universalSolanaAddressSingleton = '';
            universalBalanceSingleton = undefined;
            initialized = false;
            forceUpdate({}); // Trigger re-render
        }
    }, [networkId, disconnect, walletClient, isConnected]);

    useEffect(() => {
        if (isConnected) {
            const createUniversalAccount = async () => {
                const universalAccount = new UniversalAccount({
                    projectId: import.meta.env['VITE_APP_UA_PROJECT_ID'],
                    ownerAddress: walletClient?.account.address as any,
                });

                const [smartAccountOptions, assets] = await Promise.all([
                    universalAccount.getSmartAccountOptions(),
                    universalAccount.getPrimaryAssets(),
                ]);

                universalAddressSingleton = smartAccountOptions.smartAccountAddress ?? '';
                universalSolanaAddressSingleton = smartAccountOptions.solanaSmartAccountAddress ?? '';
                universalBalanceSingleton = assets;

                biconomyConnector.setUniversalAccount(universalAccount);
                forceUpdate({}); // Trigger re-render
            };

            if (walletClient) createUniversalAccount();
        }
    }, [disconnect, walletClient, isConnected]);

    const refetchUnifyBalance = async () => {
        const universalAccount = new UniversalAccount({
            projectId: import.meta.env['VITE_APP_UA_PROJECT_ID'],
            ownerAddress: walletClient?.account.address as any,
        });

        const assets = await universalAccount.getPrimaryAssets();

        universalBalanceSingleton = assets;

        forceUpdate({}); // Trigger re-render
    };

    return {
        smartAddress: smartAddressSingleton,
        universalAddress: universalAddressSingleton,
        universalBalance: universalBalanceSingleton,
        universalSolanaAddress: universalSolanaAddressSingleton,
        refetchUnifyBalance,
    };
}

export default useBiconomy;
