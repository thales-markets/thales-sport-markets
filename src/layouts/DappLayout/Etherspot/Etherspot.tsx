import React, { useEffect, useState } from 'react';
import { OPENLOGIN_NETWORK, OpenloginAdapter } from '@web3auth/openlogin-adapter';
import { ADAPTER_EVENTS, WALLET_ADAPTERS } from '@web3auth/base';
import { PrimeSdk, Web3WalletProvider } from '@etherspot/prime-sdk';
import Web3 from 'web3';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { useDispatch, useSelector } from 'react-redux';
import { getSwitchToNetworkId, updateIsSocialLogin, updateWallet } from 'redux/modules/wallet';
import Button from 'components/Button';
import etherspotConnector from 'utils/etherspotConnector';
import { ETHERSPOT_SUPPORTED_NETWORKS } from 'constants/etherspot';
import { Network } from 'enums/network';

const clientId = 'BEglQSgt4cUWcj6SKRdu5QkOXTsePmMcusG5EAoyjyOYKlVRjIF1iCNnMOTfpzCiunHRrMui8TIwQPXdkQ8Yxuk'; // get from https://dashboard.web3auth.io

const Etherspot: React.FC = () => {
    const dispatch = useDispatch();
    const switchedToNetworkId = useSelector(getSwitchToNetworkId);

    const [web3auth, setWeb3auth] = useState<Web3AuthNoModal | null>(null);
    // const [provider, setProvider] = useState<SafeEventEmitterProvider | null>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const chainConfig = ETHERSPOT_SUPPORTED_NETWORKS[switchedToNetworkId];

                const web3AuthInstance = new Web3AuthNoModal({
                    clientId,
                    chainConfig,
                });

                setWeb3auth(web3AuthInstance);

                const privateKeyProvider = new EthereumPrivateKeyProvider({
                    config: { chainConfig },
                });

                const openLoginAdapter = new OpenloginAdapter({
                    privateKeyProvider,
                    adapterSettings: {
                        network: OPENLOGIN_NETWORK.MAINNET,
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
                    await web3AuthInstance.addChain(
                        switchedToNetworkId === Network.OptimismMainnet
                            ? ETHERSPOT_SUPPORTED_NETWORKS[Network.ArbitrumOne]
                            : ETHERSPOT_SUPPORTED_NETWORKS[Network.OptimismMainnet]
                    );
                    const web3authProvider = web3AuthInstance.provider;
                    const web3 = new Web3(web3authProvider as any);

                    const web3provider = new Web3WalletProvider(web3.currentProvider as any);
                    // Refresh the web3 Injectable to validate the provider
                    await web3provider.refresh();
                    const etherspotPrimeSdk = new PrimeSdk(web3provider, {
                        chainId: switchedToNetworkId,
                    });
                    const address = await etherspotPrimeSdk.getCounterFactualAddress();

                    etherspotConnector.setPrimeSdk(etherspotPrimeSdk);
                    dispatch(updateWallet({ walletAddress: address }));
                    dispatch(updateIsSocialLogin(true));
                    setLoggedIn(true);
                }
            } catch (error) {
                console.error(error);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch]);

    useEffect(() => {
        const switchChain = async () => {
            if (web3auth !== null) {
                await web3auth.switchChain({
                    chainId:
                        switchedToNetworkId === Network.OptimismMainnet
                            ? ETHERSPOT_SUPPORTED_NETWORKS[Network.OptimismMainnet].chainId
                            : ETHERSPOT_SUPPORTED_NETWORKS[Network.ArbitrumOne].chainId,
                });

                if (web3auth.connected) {
                    const web3authProvider = web3auth.provider;
                    const web3 = new Web3(web3authProvider as any);

                    const web3provider = new Web3WalletProvider(web3.currentProvider as any);
                    // Refresh the web3 Injectable to validate the provider
                    await web3provider.refresh();
                    const etherspotPrimeSdk = new PrimeSdk(web3provider, {
                        chainId: switchedToNetworkId,
                    });

                    etherspotConnector.setPrimeSdk(etherspotPrimeSdk);
                }
            }
        };

        switchChain();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [switchedToNetworkId]);

    const login = async () => {
        let web3authProvider;
        try {
            if (web3auth !== null) {
                // login_hint is optional parameter which accepts any string and can be set to null
                web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, { loginProvider: 'google' });
                await web3auth.addChain(
                    switchedToNetworkId === Network.OptimismMainnet
                        ? ETHERSPOT_SUPPORTED_NETWORKS[Network.ArbitrumOne]
                        : ETHERSPOT_SUPPORTED_NETWORKS[Network.OptimismMainnet]
                );
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
            chainId: switchedToNetworkId,
        });
        const address = await etherspotPrimeSdk.getCounterFactualAddress();

        etherspotConnector.setPrimeSdk(etherspotPrimeSdk);
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
            etherspotConnector.setPrimeSdk(null);
            dispatch(updateWallet({ walletAddress: null }));
            dispatch(updateIsSocialLogin(false));
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <>
            {!loggedIn && <Button onClick={login}>Login with Google</Button>}
            {loggedIn && <Button onClick={logout}>Logout</Button>}
        </>
    );
};

export default Etherspot;
