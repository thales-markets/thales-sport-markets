import { useConnect as useParticleConnect } from '@particle-network/authkit';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Loader from 'components/Loader';
import ROUTES from 'constants/routes';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useInterval from 'hooks/useInterval';
import DappLayout from 'layouts/DappLayout';
import Theme from 'layouts/Theme';
import FreeBets from 'pages/FreeBets';
import LiquidityPool from 'pages/LiquidityPool';
import Markets from 'pages/Markets/Home';
import Market from 'pages/Markets/Market';
import Overdrop from 'pages/Overdrop';
import PnL from 'pages/PnL';
import Profile from 'pages/Profile';
import Promotions from 'pages/Promotions/Home';
import Promotion from 'pages/Promotions/Promotion';
import ResolveBlocker from 'pages/ResolveBlocker';
import SEO from 'pages/SEO/Home';
import SeoArticle from 'pages/SEO/SeoArticle';
import Ticket from 'pages/Ticket';
import { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setMobileState } from 'redux/modules/app';
import {
    getIsConnectedViaParticle,
    setIsBiconomy,
    setWalletConnectModalVisibility,
    updateParticleState,
} from 'redux/modules/wallet';
import { localStore } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { SeoArticleProps } from 'types/ui';
import { isMobile } from 'utils/device';
import { isNetworkSupported, isRouteAvailableForNetwork } from 'utils/network';
import { getSpecificConnectorFromConnectorsArray } from 'utils/particleWallet/utils';
import queryConnector from 'utils/queryConnector';
import { history } from 'utils/routes';
import { useAccount, useChainId, useConnect, useConnectors, useDisconnect, useSwitchChain } from 'wagmi';

const App = () => {
    const dispatch = useDispatch();
    const networkId = useChainId();
    const { switchChain } = useSwitchChain();
    const { disconnect } = useDisconnect();
    const { connectionStatus, disconnect: particleDisconnect } = useParticleConnect();
    const { isConnected, connector } = useAccount();
    const connectors = useConnectors();
    const { connect } = useConnect();
    const isParticleConnected = useSelector(getIsConnectedViaParticle);

    queryConnector.setQueryClient();

    // check if networks are inconsistent between connector and dApp
    useInterval(async () => {
        if (isConnected && connector && connector?.getChainId) {
            const chainId = await connector.getChainId();

            if (chainId !== networkId) {
                if (isNetworkSupported(chainId)) {
                    switchChain?.({ chainId: chainId as SupportedNetwork });
                } else {
                    disconnect();
                    dispatch(setWalletConnectModalVisibility({ visibility: true }));
                }
            }
        }
    }, 1000);

    useEffect(() => {
        const isBiconomyLocalStorage = localStore.get(LOCAL_STORAGE_KEYS.USE_BICONOMY);
        if (isBiconomyLocalStorage === undefined) {
            const overdropState = localStore.get(LOCAL_STORAGE_KEYS.OVERDROP_STATE);
            if (overdropState === undefined) {
                dispatch(setIsBiconomy(true));
                localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, true);
            } else {
                dispatch(setIsBiconomy(false));
                localStore.set(LOCAL_STORAGE_KEYS.USE_BICONOMY, false);
            }
        }
    }, [dispatch]);

    useEffect(() => {
        if (connectionStatus === 'connected') {
            connect({
                connector: getSpecificConnectorFromConnectorsArray(connectors, 'particleWalletSDK') as any,
            });
            dispatch(updateParticleState({ connectedViaParticle: true }));
        }
        if (isParticleConnected && connectionStatus === 'disconnected') {
            particleDisconnect();
            dispatch(updateParticleState({ connectedViaParticle: false }));
            if (!isConnected) disconnect();
        }
    }, [
        isConnected,
        connectors,
        connect,
        connectionStatus,
        disconnect,
        particleDisconnect,
        networkId,
        dispatch,
        isParticleConnected,
    ]);

    useEffect(() => {
        const handlePageResized = () => {
            dispatch(setMobileState(isMobile()));
        };

        handlePageResized();

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
                    <Route exact path={ROUTES.Markets.Market}>
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
                    <Route exact path={ROUTES.PnL}>
                        <DappLayout>
                            <PnL />
                        </DappLayout>
                    </Route>
                    <Route exact path={ROUTES.FreeBets}>
                        <DappLayout>
                            <FreeBets />
                        </DappLayout>
                    </Route>
                    <Route exact path={ROUTES.ResolveBlocker}>
                        <DappLayout>
                            <ResolveBlocker />
                        </DappLayout>
                    </Route>
                    <Route exact path={ROUTES.Overdrop}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Overdrop />
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
                    <Route exact path={ROUTES.Home}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Markets />
                            </DappLayout>
                        </Suspense>
                    </Route>
                    <Route exact path={ROUTES.SEO.Home}>
                        <SEO />
                    </Route>
                    <Route
                        exact
                        path={ROUTES.SEO.SeoArticle}
                        render={(routeProps) => <SeoArticle {...(routeProps as SeoArticleProps)} />}
                    />
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
            <ReactQueryDevtools initialIsOpen={false} buttonPosition={'bottom-left'} />
        </Theme>
    );
};

export default App;
