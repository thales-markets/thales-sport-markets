import { createSmartAccountClient } from '@biconomy/account';
import { LINKS } from 'constants/links';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { useAccount, useChainId, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';

// Hook for biconomy
function useBiconomy() {
    const [smartAddress, setSmartAddress] = useState('');
    const dispatch = useDispatch();
    const networkId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { switchChain } = useSwitchChain();
    const { disconnect } = useDisconnect();
    const { isConnected } = useAccount();

    useEffect(() => {
        if (walletClient && isConnected) {
            const bundlerUrl = `${LINKS.Biconomy.Bundler}${networkId}/${import.meta.env.VITE_APP_BICONOMY_BUNDLE_KEY}`;

            const createSmartAccount = async () => {
                const PAYMASTER_API_KEY = import.meta.env['VITE_APP_PAYMASTER_KEY_' + networkId];
                const smartAccount = await createSmartAccountClient({
                    signer: walletClient,
                    bundlerUrl: bundlerUrl,
                    biconomyPaymasterApiKey: PAYMASTER_API_KEY,
                });
                const smartAddressNew = await smartAccount.getAccountAddress();

                if (smartAddress === '') {
                    smartAccountConnector.setBiconomyAccount(smartAccount, smartAddressNew);
                    setSmartAddress(smartAddressNew);
                } else {
                    if (smartAddress !== smartAddressNew) {
                        smartAccountConnector.setBiconomyAccount(smartAccount, smartAddressNew);
                        setSmartAddress(smartAddressNew);
                    }
                }
            };

            createSmartAccount();
        } else {
            smartAccountConnector.resetWallet();
            setSmartAddress('');
        }
    }, [dispatch, switchChain, networkId, disconnect, walletClient, isConnected, smartAddress]);

    return { smartAddress };
}

export default useBiconomy;
