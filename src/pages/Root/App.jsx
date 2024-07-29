import { ParticleNetwork } from '@particle-network/auth';
import { ParticleProvider } from '@particle-network/provider';
import Loader from 'components/Loader';
import { SUPPORTED_NETWORKS_NAMES } from 'constants/network';
import ROUTES from 'constants/routes';
import { Network } from 'enums/network';
import { ethers } from 'ethers';
import DappLayout from 'layouts/DappLayout';
import Theme from 'layouts/Theme';
import Profile from 'pages/Profile';
import Referral from 'pages/Referral';
import { Suspense, lazy, useEffect } from 'react';
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
    updateParticleState,
    updateWallet,
} from 'redux/modules/wallet';
import { isMobile } from 'utils/device';
import { isNetworkSupported, isRouteAvailableForNetwork } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import queryConnector from 'utils/queryConnector';
import { buildHref, history } from 'utils/routes';
import { mainnet, useAccount, useDisconnect, useNetwork, useProvider, useSigner } from 'wagmi';
import RouterProvider from './Provider/RouterProvider/RouterProvider';

// const LandingPage = lazy(() => import('pages/LandingPage'));
const Markets = lazy(() => import('pages/Markets/Home'));
const Market = lazy(() => import('pages/Markets/Market'));
const Ticket = lazy(() => import('pages/Ticket'));
const ParlayLeaderboard = lazy(() => import('pages/ParlayLeaderboard'));
const LiquidityPool = lazy(() => import('pages/LiquidityPool'));
const Deposit = lazy(() => import('pages/AARelatedPages/Deposit'));
const Withdraw = lazy(() => import('pages/AARelatedPages/Withdraw'));
const GetStarted = lazy(() => import('pages/AARelatedPages/GetStarted'));
const Promotions = lazy(() => import('pages/Promotions/Home'));
const Promotion = lazy(() => import('pages/Promotions/Promotion'));

const particle = new ParticleNetwork({
    projectId: import.meta.env.VITE_APP_PARTICLE_PROJECT_ID,
    clientKey: import.meta.env.VITE_APP_CLIENT_KEY,
    appId: import.meta.env.VITE_APP_PARTICLE_APP_ID,
    chainName: 'optimism',
    chainId: 10,
    wallet: {
        //optional: by default, the wallet entry is displayed in the bottom right corner of the webpage.
        displayWalletEntry: false, //show wallet entry when connect particle.
        uiMode: 'dark', //optional: light or dark, if not set, the default is the same as web auth.
        supportChains: [
            { id: Network.OptimismMainnet, name: 'optimism' },
            { id: Network.Arbitrum, name: 'arbitrum' },
            { id: Network.Base, name: 'base' },
        ], // optional: web wallet support chains.
        customStyle: {}, //optional: custom wallet style
    },
});

const App = () => {
    const dispatch = useDispatch();
    const networkId = useSelector((state) => getNetworkId(state));
    const switchedToNetworkId = useSelector((state) => getSwitchToNetworkId(state));
    // const isConnectedViaParticle = useSelector((state) => getIsConnectedViaParticle(state));

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
                let web3Provider;

                if (particle?.auth?.isLogin()) {
                    const particleProvider = new ParticleProvider(particle.auth);
                    web3Provider = new ethers.providers.Web3Provider(particleProvider, 'any');
                }

                networkConnector.setNetworkSettings({
                    networkId: providerNetworkId,
                    provider,
                    signer: web3Provider ? web3Provider.getSigner() : signer,
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
        dispatch(updateParticleState({ connectedViaParticle: !!particle?.auth?.isLogin() }));
    }, [dispatch, address, signer]);

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
        if (window.ethereum && window.ethereum.on) {
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
                                    path={ROUTES.Ticket}
                                    render={(routeProps) => (
                                        <DappLayout>
                                            <Ticket {...routeProps} />
                                        </DappLayout>
                                    )}
                                />
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

                                <Route exact path={ROUTES.Deposit}>
                                    <DappLayout>
                                        <Deposit />
                                    </DappLayout>
                                </Route>

                                <Route exact path={ROUTES.Withdraw}>
                                    <DappLayout>
                                        <Withdraw />
                                    </DappLayout>
                                </Route>

                                <Route exact path={ROUTES.Wizard}>
                                    <DappLayout>
                                        <GetStarted />
                                        {/* {isConnectedViaParticle && <GetStarted />}
                                        {!isConnectedViaParticle && <Wizard />} */}
                                    </DappLayout>
                                </Route>
                                {isRouteAvailableForNetwork(ROUTES.LiquidityPool, networkId) && (
                                    <Route exact path={ROUTES.LiquidityPool}>
                                        <DappLayout>
                                            <LiquidityPool />
                                        </DappLayout>
                                    </Route>
                                )}
                                <Route exact path={ROUTES.Promotions.Home}>
                                    <DappLayout>
                                        <Promotions />
                                    </DappLayout>
                                </Route>
                                <Route
                                    exact
                                    path={ROUTES.Promotions.Promotion}
                                    render={(routeProps) => (
                                        <DappLayout>
                                            <Promotion {...routeProps} />
                                        </DappLayout>
                                    )}
                                />
                                <Route exact path={ROUTES.Home}>
                                    <DappLayout>
                                        <Markets />
                                    </DappLayout>
                                </Route>
                                <Route>
                                    <Redirect to={ROUTES.Markets.Home} />
                                    <DappLayout>
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
