import { IAssetsResponse, UniversalAccount } from '@particle-network/universal-account-sdk';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import smartAccountConnector from 'utils/smartAccount/smartAccountConnector';
import { delay } from 'utils/timer';
import { useAccount, useChainId, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';

let universalAddressSingleton = '';
let universalSolanaAddressSingleton = '';
let universalBalanceSingleton: IAssetsResponse | undefined;
let initialized = false;

function useUniversalAccount() {
    const [smartAddress, setSmartAddress] = useState('');
    const [, forceUpdate] = useState({});
    const networkId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { disconnect } = useDisconnect();
    const { isConnected } = useAccount();
    const dispatch = useDispatch();
    const { switchChain } = useSwitchChain();

    useEffect(() => {
        if (walletClient && isConnected) {
            const createUniversalAccount = async () => {
                const universalAccount = new UniversalAccount({
                    projectId: import.meta.env['VITE_APP_UA_PROJECT_ID'],
                    ownerAddress: walletClient?.account.address as any,
                });

                const [smartAccountOptions, assets] = await Promise.all([
                    universalAccount.getSmartAccountOptions(),
                    universalAccount.getPrimaryAssets(),
                ]);

                const smartAddressNew = smartAccountOptions.smartAccountAddress;

                if (smartAddress === '') {
                    setSmartAddress(smartAddressNew as any);
                    universalAddressSingleton = smartAccountOptions.smartAccountAddress ?? '';
                    universalSolanaAddressSingleton = smartAccountOptions.solanaSmartAccountAddress ?? '';
                    universalBalanceSingleton = assets;

                    smartAccountConnector.setUniversalAccount(universalAccount);
                    initialized = true;
                    forceUpdate({}); // Trigger re-render
                } else {
                    if (smartAddress !== smartAddressNew) {
                        setSmartAddress(smartAddressNew as any);
                        universalAddressSingleton = smartAccountOptions.smartAccountAddress ?? '';
                        universalSolanaAddressSingleton = smartAccountOptions.solanaSmartAccountAddress ?? '';
                        universalBalanceSingleton = assets;

                        smartAccountConnector.setUniversalAccount(universalAccount);
                        initialized = true;
                        forceUpdate({}); // Trigger re-render
                    }
                }
            };

            createUniversalAccount();
        } else {
            smartAccountConnector.setUniversalAccount(null);
            setSmartAddress('');
            if (initialized) {
                universalAddressSingleton = '';
                universalSolanaAddressSingleton = '';
                universalBalanceSingleton = undefined;
                initialized = false;
                forceUpdate({}); // Trigger re-render
            }
        }
    }, [dispatch, switchChain, networkId, disconnect, walletClient, isConnected, smartAddress]);

    const refetchUnifyBalance = async () => {
        let RETRY_COUNT = 0;
        const universalAccount = new UniversalAccount({
            projectId: import.meta.env['VITE_APP_UA_PROJECT_ID'],
            ownerAddress: walletClient?.account.address as any,
        });

        while (RETRY_COUNT <= 10) {
            const assets = await universalAccount.getPrimaryAssets();
            if (assets.totalAmountInUSD !== universalBalanceSingleton?.totalAmountInUSD) {
                universalBalanceSingleton = assets;
                break;
            } else {
                RETRY_COUNT++;
                await delay(1000);
            }
        }

        forceUpdate({}); // Trigger re-render
    };

    return {
        universalAddress: universalAddressSingleton,
        universalBalance: universalBalanceSingleton,
        universalSolanaAddress: universalSolanaAddressSingleton,
        refetchUnifyBalance,
    };
}

export default useUniversalAccount;
