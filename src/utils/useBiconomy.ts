import { createSmartAccountClient } from '@biconomy/account';
import { UniversalAccount } from '@GDdark/universal-account';
import { LINKS } from 'constants/links';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAccount, useChainId, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import biconomyConnector from './biconomyWallet';

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

                const universalAccount = new UniversalAccount({
                    projectId: import.meta.env['VITE_APP_UA_PROJECT_ID'],
                    ownerAddress: walletClient.account.address,
                });

                const smartAccountOptions = await universalAccount.getSmartAccountOptions();
                console.log('smartAccountOptions: ', smartAccountOptions);

                if (smartAddress === '') {
                    biconomyConnector.setWallet(smartAccount, smartAddressNew, universalAccount);
                    setSmartAddress(smartAddressNew);
                } else {
                    if (smartAddress !== smartAddressNew) {
                        biconomyConnector.setWallet(smartAccount, smartAddressNew, universalAccount);
                        setSmartAddress(smartAddressNew);
                    }
                }
            };

            createSmartAccount();
        } else {
            biconomyConnector.resetWallet();
            setSmartAddress('');
        }
    }, [dispatch, switchChain, networkId, disconnect, walletClient, isConnected, smartAddress]);

    return smartAddress;
}

export default useBiconomy;
