import Loader from 'components/Loader';
import React, { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setAppReady, setMobileState } from 'redux/modules/app';
import { getNetworkId, updateNetworkSettings, updateWallet, getIsWalletConnected } from 'redux/modules/wallet';
import queryConnector from 'utils/queryConnector';
import { history } from 'utils/routes';
import networkConnector from 'utils/networkConnector';
import { hasEthereumInjected, isNetworkSupported, isRouteAvailableForNetwork } from 'utils/network';
import ROUTES from 'constants/routes';
import Theme from 'layouts/Theme';
import DappLayout from 'layouts/DappLayout';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useAccount, useProvider, useSigner, useClient, useDisconnect } from 'wagmi';
import LandingPageLayout from 'layouts/LandingPageLayout';
import { ethers } from 'ethers';
import BannerCarousel from 'components/BannerCarousel';
import { isMobile } from 'utils/device';
import Profile from 'pages/Profile';
import Wizard from 'pages/Wizard';
import Referral from 'pages/Referral';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import MarchMadness from 'pages/MarchMadness';
import { isMarchMadnessAvailableForNetworkId } from 'utils/marchMadness';

const LandingPage = lazy(() => import('pages/LandingPage'));
const Markets = lazy(() => import('pages/Markets/Home'));
const Market = lazy(() => import('pages/Markets/Market'));
const Rewards = lazy(() => import('pages/Rewards'));
const Quiz = lazy(() => import('pages/Quiz'));
const QuizLeaderboard = lazy(() => import('pages/Quiz/Leaderboard'));
const Vaults = lazy(() => import('pages/Vaults'));
const Vault = lazy(() => import('pages/Vault'));
const ParlayLeaderboard = lazy(() => import('pages/ParlayLeaderboard'));
const LiquidityPool = lazy(() => import('pages/LiquidityPool'));

const App = () => {
    const dispatch = useDispatch();
    const { trackPageView, trackEvent } = useMatomo();
    const networkId = useSelector((state) => getNetworkId(state));
    const isWalletConnected = useSelector((state) => getIsWalletConnected(state));

    const provider = useProvider(!hasEthereumInjected() && { chainId: networkId }); // for incognito mode set chainId from dApp
    const { address } = useAccount();
    const { data: signer } = useSigner();
    const client = useClient();
    const { disconnect } = useDisconnect();

    queryConnector.setQueryClient();

    useEffect(() => {
        const root = document.querySelector('#root');

        if (!root) return false;

        root.addEventListener('click', (e) => {
            const elementsToCheck = [];
            const parentLevelCheck = 3;

            let targetElement = e.target;
            elementsToCheck.push(e.target);

            for (var i = 0; i < parentLevelCheck; i++) {
                const parent = targetElement?.parentElement;
                if (!parent) break;
                targetElement = targetElement.parentElement;
                elementsToCheck.push(parent);
            }

            const elementWithMatomoTags =
                elementsToCheck &&
                elementsToCheck.find((item) => item?.dataset?.matomoCategory || item?.data?.matomoAction);

            if (elementWithMatomoTags) {
                trackEvent({
                    category: elementWithMatomoTags.dataset.matomoCategory,
                    action: elementWithMatomoTags.dataset?.matomoAction
                        ? elementWithMatomoTags.dataset?.matomoAction
                        : '',
                });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const init = async () => {
            let providerNetworkId = address && (await provider.getNetwork()).chainId;
            let mmChainId = undefined;

            if (!providerNetworkId) {
                // can't use wagmi when wallet is not connected
                if (hasEthereumInjected()) {
                    mmChainId = parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16);
                    if (isNetworkSupported(mmChainId)) {
                        providerNetworkId = mmChainId;
                    } else {
                        providerNetworkId = DEFAULT_NETWORK_ID;
                        disconnect();
                    }
                } else {
                    // without MM, for incognito mode
                    providerNetworkId = isNetworkSupported(networkId) ? networkId : DEFAULT_NETWORK_ID;
                }
            }
            try {
                // when switching network will throw Error: underlying network changed and then ignore network update
                signer && signer.provider && (await signer.provider.getNetwork()).chainId;

                // can't use wagmi provider when wallet exists in browser but locked, then use MM network if supported
                const selectedProvider =
                    !address && hasEthereumInjected() && isNetworkSupported(mmChainId)
                        ? new ethers.providers.Web3Provider(window.ethereum, 'any')
                        : provider;

                networkConnector.setNetworkSettings({
                    networkId: providerNetworkId,
                    provider: selectedProvider,
                    signer,
                });

                dispatch(updateNetworkSettings({ networkId: providerNetworkId }));
                dispatch(setAppReady());
            } catch (e) {
                dispatch(setAppReady());
                if (!e.toString().includes('Error: underlying network changed')) {
                    console.log(e);
                }
            }
        };
        init();
    }, [dispatch, provider, signer, networkId, disconnect, address]);

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
        const autoConnect = async () => {
            // TD-1083: There is a known issue with MetaMask extension, where a "disconnect" event is emitted
            // when you switch from MetaMask's default networks to custom networks.
            await client.autoConnect();
        };

        if (window.ethereum) {
            window.ethereum.on('chainChanged', (chainIdHex) => {
                const chainId = parseInt(chainIdHex, 16);
                if (!address) {
                    // when wallet exists in browser but locked and changing network from MM update networkId manually
                    const supportedNetworkId = isNetworkSupported(chainId) ? chainId : DEFAULT_NETWORK_ID;
                    dispatch(updateNetworkSettings({ networkId: supportedNetworkId }));
                }
                if (isNetworkSupported(chainId)) {
                    if (window.ethereum.isMetaMask && !isWalletConnected) {
                        autoConnect();
                    }
                } else {
                    disconnect();
                }
            });
        }
    }, [client, isWalletConnected, dispatch, disconnect, provider, signer, address]);

    useEffect(() => {
        trackPageView();
    }, [trackPageView]);

    return (
        <Theme>
            <QueryClientProvider client={queryConnector.queryClient}>
                <Suspense fallback={<Loader />}>
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
                            {isRouteAvailableForNetwork(ROUTES.Rewards, networkId) && (
                                <Route exact path={ROUTES.Rewards}>
                                    <DappLayout>
                                        <Rewards />
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
                            {isMarchMadnessAvailableForNetworkId(networkId) && (
                                <Route exact path={ROUTES.MarchMadness}>
                                    <DappLayout>
                                        <MarchMadness />
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
                    <ReactQueryDevtools initialIsOpen={false} />
                </Suspense>
            </QueryClientProvider>
        </Theme>
    );
};

export default App;
