import React, { useEffect, useState } from 'react';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { ADAPTER_EVENTS, CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base';
import { PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import Web3 from 'web3';
import { SubmitButton } from '../../../pages/Markets/Home/Parlay/components/styled-components';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { useDispatch } from 'react-redux';
import { updateIsSocialLogin, updatePrimeSdk, updateWallet } from 'redux/modules/wallet';

const clientId = 'BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk'; // get from https://dashboard.web3auth.io

const Etherspot: React.FC = () => {
    const dispatch = useDispatch();
    const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
    // const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const chainConfig = {
                    chainNamespace: CHAIN_NAMESPACES.EIP155,
                    chainId: '0xa', // Please use 0x1 for Mainnet
                    rpcTarget: 'https://rpc.ankr.com/optimism',
                    displayName: 'Optimism Mainnet',
                    blockExplorer: 'https://optimistic.etherscan.io/',
                    ticker: 'ETH',
                    tickerName: 'Ethereum',
                };

                // ETH_Goerli

                const web3AuthInstance = new Web3AuthNoModal({
                    clientId, // created in the Web3Auth Dashboard as described above
                    chainConfig,
                });
                setWeb3auth(web3AuthInstance);

                const privateKeyProvider = new EthereumPrivateKeyProvider({
                    config: { chainConfig },
                });

                const openLoginAdapter = new OpenloginAdapter({
                    privateKeyProvider,
                    adapterSettings: {
                        network: 'mainnet',
                        clientId,
                    },
                    loginSettings: {
                        mfaLevel: 'none',
                    },
                });

                web3AuthInstance.configureAdapter(openLoginAdapter as any);

                // Listen to events emitted by the Web3Auth Adapter
                web3AuthInstance.on(ADAPTER_EVENTS.CONNECTED, () => {
                    if (!web3AuthInstance?.provider) {
                        return;
                    }
                });

                web3AuthInstance.on(ADAPTER_EVENTS.ERRORED, (error) => {
                    console.log(error);
                });

                // Initialise the web3Auth instance after setting up the Adapter Configuration
                await web3AuthInstance.init();

                if (web3AuthInstance.connected) {
                    const web3authProvider = web3AuthInstance.provider;
                    const web3 = new Web3(web3authProvider as any);

                    const web3provider = new Web3WalletProvider(web3.currentProvider as any);
                    // Refresh the web3 Injectable to validate the provider
                    await web3provider.refresh();
                    const etherspotPrimeSdk = new PrimeSdk(web3provider, {
                        chainId: 10,
                    });
                    const address = await etherspotPrimeSdk.getCounterFactualAddress();

                    dispatch(updatePrimeSdk(etherspotPrimeSdk));
                    dispatch(updateWallet({ walletAddress: address }));
                    dispatch(updateIsSocialLogin(true));
                    setLoggedIn(true);
                }
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, [dispatch]);

    const login = async () => {
        let web3authProvider;
        try {
            if (web3auth !== null) {
                // login_hint is optional parameter which accepts any string and can be set to null
                web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, { loginProvider: 'google' });
            }
        } catch (e) {
            console.log(`Failed to login! Reason: ${e instanceof Error && e?.message ? e.message : 'unknown'}.`);
            return;
        }

        if (!web3authProvider) {
            console.log(`Failed to get the provider connected`);
            return;
        }
        // Initialising web3Auth Provider as Web3 Injectable
        const web3 = new Web3(web3authProvider as any);
        const web3provider = new Web3WalletProvider(web3.currentProvider as any);
        // Refresh the web3 Injectable to validate the provider
        await web3provider.refresh();

        // Initialise the Etherspot SDK
        // const etherspotSdk = new Sdk(web3provider, {
        //     networkName: NetworkNames.Optimism,
        //     env: EnvNames.MainNets,
        //     omitWalletProviderNetworkCheck: true,
        // });
        // const test = await etherspotSdk.computeContractAccount();
        // console.log(test, web3provider);

        const etherspotPrimeSdk = new PrimeSdk(web3provider, {
            chainId: 10,
        });
        const address = await etherspotPrimeSdk.getCounterFactualAddress();

        dispatch(updatePrimeSdk(etherspotPrimeSdk));
        dispatch(updateWallet({ walletAddress: address }));
        dispatch(updateIsSocialLogin(true));
        setLoggedIn(true);

        console.log(address);
    };

    const logout = async () => {
        try {
            if (!web3auth) {
                console.log('web3auth not initialized yet');
                return;
            }
            await web3auth.logout();

            setLoggedIn(false);
            dispatch(updatePrimeSdk(null));
            dispatch(updateWallet({ walletAddress: null }));
            dispatch(updateIsSocialLogin(false));
        } catch (e) {
            console.log(e);
        }
    };

    console.log('loggedIn', loggedIn);

    return (
        <>
            {!loggedIn && <SubmitButton onClick={login}>Login with Google</SubmitButton>}
            {loggedIn && <SubmitButton onClick={logout}>Logout</SubmitButton>}
        </>
    );
};

export default Etherspot;
