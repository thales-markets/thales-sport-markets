import { createSmartAccountClient } from '@biconomy/account';
import { IAssetsResponse, UniversalAccount } from '@GDdark/universal-account';
import { LINKS } from 'constants/links';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAccount, useChainId, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import biconomyConnector from './biconomyWallet';

// Singleton state outside the hook
let smartAddressSingleton = '';
let universalAddressSingleton = '';
let universalBalanceSingleton: IAssetsResponse | undefined;
let initialized = false;

function useBiconomy() {
    const [, forceUpdate] = useState({});
    const dispatch = useDispatch();
    const networkId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { switchChain } = useSwitchChain();
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

                const universalAccount = new UniversalAccount({
                    projectId: import.meta.env['VITE_APP_UA_PROJECT_ID'],
                    ownerAddress: walletClient?.account.address as any,
                });

                const [smartAddressNew, smartAccountOptions, assets] = await Promise.all([
                    smartAccount.getAccountAddress(),
                    universalAccount.getSmartAccountOptions(),
                    universalAccount.getPrimaryAssets(),
                ]);

                if (!initialized) {
                    smartAddressSingleton = smartAddressNew;
                    universalAddressSingleton = smartAccountOptions.smartAccountAddress ?? '';
                    universalBalanceSingleton = assets;
                    initialized = true;

                    biconomyConnector.setWallet(smartAccount, smartAddressNew, universalAccount);
                    forceUpdate({}); // Trigger re-render
                }
            };

            if (walletClient) createSmartAccount();
        } else if (initialized) {
            biconomyConnector.resetWallet();
            smartAddressSingleton = '';
            universalAddressSingleton = '';
            universalBalanceSingleton = undefined;
            initialized = false;
            forceUpdate({}); // Trigger re-render
        }
    }, [dispatch, switchChain, networkId, disconnect, walletClient, isConnected]);

    return {
        smartAddress: smartAddressSingleton,
        universalAddress: universalAddressSingleton,
        universalBalance: universalBalanceSingleton,
    };
}

export default useBiconomy;
