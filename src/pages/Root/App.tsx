import { createSmartAccountClient } from '@biconomy/account';
import { AuthCoreEvent, SocialAuthType, getLatestAuthType, particleAuth } from '@particle-network/auth-core';
import { useConnect as useParticleConnect } from '@particle-network/auth-core-modal';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Loader from 'components/Loader';
import { LINKS } from 'constants/links';
import ROUTES from 'constants/routes';
import DappLayout from 'layouts/DappLayout';
import Theme from 'layouts/Theme';
import Deposit from 'pages/AARelatedPages/Deposit';
import GetStarted from 'pages/AARelatedPages/GetStarted';
import Withdraw from 'pages/AARelatedPages/Withdraw';
import LiquidityPool from 'pages/LiquidityPool';
import Markets from 'pages/Markets/Home';
import Market from 'pages/Markets/Market';
import Overdrop from 'pages/Overdrop';
import PnL from 'pages/PnL';
import Profile from 'pages/Profile';
import Promotions from 'pages/Promotions/Home';
import Promotion from 'pages/Promotions/Promotion';
import Ticket from 'pages/Ticket';
import { Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setAppReady, setMobileState } from 'redux/modules/app';
import { setIsBiconomy } from 'redux/modules/wallet';
import { SupportedNetwork } from 'types/network';
import biconomyConnector from 'utils/biconomyWallet';
import { isMobile } from 'utils/device';
import { isNetworkSupported, isRouteAvailableForNetwork } from 'utils/network';
import { particleWagmiWallet } from 'utils/particleWallet/particleWagmiWallet';
import { isSocialLogin } from 'utils/particleWallet/utils';
import queryConnector from 'utils/queryConnector';
import { history } from 'utils/routes';
import { useChainId, useConnect, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';

const App = () => {
    const dispatch = useDispatch();
    const networkId = useChainId();
    const { data: walletClient } = useWalletClient();

    const { switchChain } = useSwitchChain();
    const { disconnect } = useDisconnect();
    const { connect } = useConnect();
    const { connectionStatus } = useParticleConnect();

    queryConnector.setQueryClient();

    useEffect(() => {
        dispatch(setAppReady());
    }, [dispatch]);

    useEffect(() => {
        if (window.ethereum && window.ethereum.on) {
            window.ethereum.on('chainChanged', (chainIdParam: string) => {
                const ethereumChainId = Number.isInteger(chainIdParam)
                    ? Number(chainIdParam)
                    : parseInt(chainIdParam, 16);

                if (!isNetworkSupported(ethereumChainId)) {
                    // when network changed from browser wallet disconnect wallet otherwise wallet is unusable (e.g. wallet options doesn't react)
                    disconnect();
                }
                switchChain({ chainId: ethereumChainId as SupportedNetwork });
            });
        }

        if (walletClient && isSocialLogin(getLatestAuthType())) {
            const bundlerUrl = `${LINKS.Biconomy.Bundler}${networkId}/${import.meta.env.VITE_APP_BICONOMY_BUNDLE_KEY}`;

            const createSmartAccount = async () => {
                const PAYMASTER_API_KEY = import.meta.env['VITE_APP_PAYMASTER_KEY_' + networkId];
                const smartAccount = await createSmartAccountClient({
                    signer: walletClient,
                    bundlerUrl: bundlerUrl,
                    biconomyPaymasterApiKey: PAYMASTER_API_KEY,
                });
                const smartAddress = await smartAccount.getAccountAddress();

                if (!biconomyConnector.address || biconomyConnector.address === smartAddress) {
                    biconomyConnector.setWallet(smartAccount, smartAddress);
                    dispatch(setIsBiconomy(true));
                }
            };

            createSmartAccount();
        }
    }, [dispatch, switchChain, networkId, disconnect, walletClient]);

    useEffect(() => {
        if (connectionStatus === 'connected' && isSocialLogin(getLatestAuthType())) {
            connect({
                connector: particleWagmiWallet({
                    socialType: getLatestAuthType() as SocialAuthType,
                    id: 'adqd',
                }) as any,
                chainId: networkId,
            });
        }
        const onDisconnect = () => {
            dispatch(setIsBiconomy(false));
            biconomyConnector.resetWallet();
            disconnect();
        };
        particleAuth.on(AuthCoreEvent.ParticleAuthDisconnect, onDisconnect);
        return () => {
            particleAuth.off(AuthCoreEvent.ParticleAuthDisconnect, onDisconnect);
        };
    }, [connect, connectionStatus, disconnect, networkId, dispatch]);

    useEffect(() => {
        const handlePageResized = () => {
            dispatch(setMobileState(isMobile()));
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handlePageResized);
            window.addEventListener('orientationchange', handlePageResized);
            window.addEventListener('load', handlePageResized);
            window.addEventListener('reload', handlePageResized);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handlePageResized);
                window.removeEventListener('orientationchange', handlePageResized);
                window.removeEventListener('load', handlePageResized);
                window.removeEventListener('reload', handlePageResized);
            }
        };
    }, [dispatch]);

    return (
        <Theme>
            <Router history={history}>
                <Switch>
                    <Route exact path={ROUTES.Ticket}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Ticket />
                            </DappLayout>
                        </Suspense>
                    </Route>
                    <Route exact path={`${ROUTES.Markets.Market}/:marketAddress`}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Market />
                            </DappLayout>
                        </Suspense>
                    </Route>
                    <Route exact path={ROUTES.Markets.Home}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Markets />
                            </DappLayout>
                        </Suspense>
                    </Route>
                    {isRouteAvailableForNetwork(ROUTES.Profile, networkId) && (
                        <Route exact path={ROUTES.Profile}>
                            <Suspense fallback={<Loader />}>
                                <DappLayout>
                                    <Profile />
                                </DappLayout>
                            </Suspense>
                        </Route>
                    )}
                    {
                        <Route exact path={ROUTES.Overdrop}>
                            <Suspense fallback={<Loader />}>
                                <DappLayout>
                                    <Overdrop />
                                </DappLayout>
                            </Suspense>
                        </Route>
                    }

                    <Route exact path={ROUTES.Deposit}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Deposit />
                            </DappLayout>
                        </Suspense>
                    </Route>

                    <Route exact path={ROUTES.Withdraw}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Withdraw />
                            </DappLayout>
                        </Suspense>
                    </Route>

                    <Route exact path={ROUTES.Wizard}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <GetStarted />
                            </DappLayout>
                        </Suspense>
                    </Route>
                    {isRouteAvailableForNetwork(ROUTES.LiquidityPool, networkId) && (
                        <Route exact path={ROUTES.LiquidityPool}>
                            <Suspense fallback={<Loader />}>
                                <DappLayout>
                                    <LiquidityPool />
                                </DappLayout>
                            </Suspense>
                        </Route>
                    )}
                    <Route exact path={ROUTES.Promotions.Home}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Promotions />
                            </DappLayout>
                        </Suspense>
                    </Route>
                    <Route exact path={ROUTES.Promotions.Promotion}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Promotion />
                            </DappLayout>
                        </Suspense>
                    </Route>
                    <Route exact path={ROUTES.PnL}>
                        <DappLayout>
                            <PnL />
                        </DappLayout>
                    </Route>
                    <Route exact path={ROUTES.Home}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Markets />
                            </DappLayout>
                        </Suspense>
                    </Route>
                    <Route>
                        <Redirect to={ROUTES.Markets.Home} />
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Markets />
                            </DappLayout>
                        </Suspense>
                    </Route>
                </Switch>
            </Router>
            <ReactQueryDevtools initialIsOpen={false} />
        </Theme>
    );
};

export default App;
