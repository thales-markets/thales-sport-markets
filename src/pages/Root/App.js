import BannerCarousel from 'components/BannerCarousel';
import Loader from 'components/Loader';
import { SUPPORTED_NETWORKS_NAMES } from 'constants/network';
import ROUTES from 'constants/routes';
import DappLayout from 'layouts/DappLayout';
import LandingPageLayout from 'layouts/LandingPageLayout';
import Theme from 'layouts/Theme';
import Profile from 'pages/Profile';
import Referral from 'pages/Referral';
import Wizard from 'pages/Wizard';
import { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setAppReady, setMobileState } from 'redux/modules/app';
import {
    getNetworkId,
    getSwitchToNetworkId,
    switchToNetworkId,
    updateNetworkSettings,
    updateWallet,
} from 'redux/modules/wallet';
import { isMobile } from 'utils/device';
import { isNetworkSupported, isRouteAvailableForNetwork } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import queryConnector from 'utils/queryConnector';
import { buildHref, history } from 'utils/routes';
import { mainnet, useAccount, useDisconnect, useNetwork, useProvider, useSigner } from 'wagmi';
import RouterProvider from './Provider/RouterProvider/RouterProvider';

const LandingPage = lazy(() => import('pages/LandingPage'));
const Markets = lazy(() => import('pages/Markets/Home'));
const Market = lazy(() => import('pages/Markets/Market'));
const Quiz = lazy(() => import('pages/Quiz'));
const QuizLeaderboard = lazy(() => import('pages/Quiz/Leaderboard'));
const Vaults = lazy(() => import('pages/Vaults'));
const Vault = lazy(() => import('pages/Vault'));
const ParlayLeaderboard = lazy(() => import('pages/ParlayLeaderboard'));
const LiquidityPool = lazy(() => import('pages/LiquidityPool'));

const App = () => {
    const dispatch = useDispatch();
    const networkId = useSelector((state) => getNetworkId(state));
    const switchedToNetworkId = useSelector((state) => getSwitchToNetworkId(state));

    const { address } = useAccount();
    const provider = useProvider(!address && { chainId: switchedToNetworkId }); // when wallet not connected force chain
    const { data: signer } = useSigner();
    const { disconnect } = useDisconnect();
    const { chain } = useNetwork();

    queryConnector.setQueryClient();

    useEffect(() => {
        const init = async () => {
            try {
                const chainIdFromProvider = (await provider.getNetwork()).chainId;
                const providerNetworkId = !!address ? chainIdFromProvider : switchedToNetworkId;

                networkConnector.setNetworkSettings({
                    networkId: providerNetworkId,
                    provider,
                    signer,
                });

                dispatch(
                    updateNetworkSettings({
                        networkId: providerNetworkId,
                        networkName: SUPPORTED_NETWORKS_NAMES[providerNetworkId]?.toLowerCase(),
                    })
                );
                dispatch(setAppReady());
            } catch (e) {
                dispatch(setAppReady());
                console.log(e);
            }
        };
        init();
    }, [dispatch, provider, signer, switchedToNetworkId, address]);

    useEffect(() => {
        dispatch(updateWallet({ walletAddress: address }));
    }, [address, dispatch]);

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

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', (chainIdParam) => {
                const chainId = Number.isInteger(chainIdParam) ? chainIdParam : parseInt(chainIdParam, 16);

                if (!address && isNetworkSupported(chainId)) {
                    // when wallet disconnected reflect network change from browser wallet to dApp
                    dispatch(switchToNetworkId({ networkId: chainId }));
                }
            });
        }
    }, [dispatch, address]);

    useEffect(() => {
        // only Wizard page requires mainnet because of Bridge functionality
        if (chain?.unsupported && !(chain?.id === mainnet.id && location.pathname === buildHref(ROUTES.Wizard))) {
            disconnect();
        }
    }, [disconnect, chain]);

    return (
        <Theme>
            <QueryClientProvider client={queryConnector.queryClient}>
                <Suspense fallback={<Loader />}>
                    <RouterProvider>
                        <Router history={history}>
                            <Switch>
                                <Route
                                    exact
                                    path={ROUTES.Markets.Market}
                                    render={(routeProps) => (
                                        <DappLayout>
                                            <Market {...routeProps} />
                                        </DappLayout>
                                    )}
                                />
                                <Route exact path={ROUTES.Markets.Home}>
                                    <DappLayout>
                                        <BannerCarousel />
                                        <Markets />
                                    </DappLayout>
                                </Route>
                                {isRouteAvailableForNetwork(ROUTES.Leaderboard, networkId) && (
                                    <Route exact path={ROUTES.Leaderboard}>
                                        <DappLayout>
                                            <ParlayLeaderboard />
                                        </DappLayout>
                                    </Route>
                                )}
                                {isRouteAvailableForNetwork(ROUTES.Profile, networkId) && (
                                    <Route exact path={ROUTES.Profile}>
                                        <DappLayout>
                                            <Profile />
                                        </DappLayout>
                                    </Route>
                                )}
                                {isRouteAvailableForNetwork(ROUTES.Referral, networkId) && (
                                    <Route exact path={ROUTES.Referral}>
                                        <DappLayout>
                                            <Referral />
                                        </DappLayout>
                                    </Route>
                                )}
                                <Route exact path={ROUTES.Wizard}>
                                    <DappLayout>
                                        <Wizard />
                                    </DappLayout>
                                </Route>
                                {isRouteAvailableForNetwork(ROUTES.Quiz, networkId) && (
                                    <Route exact path={ROUTES.Quiz}>
                                        <DappLayout>
                                            <Quiz />
                                        </DappLayout>
                                    </Route>
                                )}
                                {isRouteAvailableForNetwork(ROUTES.Vaults, networkId) && (
                                    <Route exact path={ROUTES.Vaults}>
                                        <DappLayout>
                                            <Vaults />
                                        </DappLayout>
                                    </Route>
                                )}

                                {isRouteAvailableForNetwork(ROUTES.Vaults, networkId) && (
                                    <Route
                                        exact
                                        path={ROUTES.Vault}
                                        render={(routeProps) => (
                                            <DappLayout>
                                                <Vault {...routeProps} />
                                            </DappLayout>
                                        )}
                                    />
                                )}

                                {isRouteAvailableForNetwork(ROUTES.QuizLeaderboard, networkId) && (
                                    <Route exact path={ROUTES.QuizLeaderboard}>
                                        <DappLayout>
                                            <QuizLeaderboard />
                                        </DappLayout>
                                    </Route>
                                )}
                                {isRouteAvailableForNetwork(ROUTES.LiquidityPool, networkId) && (
                                    <Route exact path={ROUTES.LiquidityPool}>
                                        <DappLayout>
                                            <LiquidityPool />
                                        </DappLayout>
                                    </Route>
                                )}
                                <Route exact path={ROUTES.Home}>
                                    <LandingPageLayout>
                                        <LandingPage />
                                    </LandingPageLayout>
                                </Route>
                                <Route>
                                    <Redirect to={ROUTES.Markets.Home} />
                                    <DappLayout>
                                        <BannerCarousel />
                                        <Markets />
                                    </DappLayout>
                                </Route>
                            </Switch>
                        </Router>
                    </RouterProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </Suspense>
            </QueryClientProvider>
        </Theme>
    );
};

export default App;
