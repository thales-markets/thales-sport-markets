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
import { getDefaultNetworkId } from 'utils/network';
import ROUTES from 'constants/routes';
import Theme from 'layouts/Theme';
import DappLayout from 'layouts/DappLayout';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useAccount, useProvider, useSigner, useClient } from 'wagmi';
import LandingPageLayout from 'layouts/LandingPageLayout';
import { ethers } from 'ethers';
import BannerCarousel from 'components/BannerCarousel';
import { isMobile } from 'utils/device';
import Profile from 'pages/Profile';
import Wizard from 'pages/Wizard';
import Referral from 'pages/Referral';

const LandingPage = lazy(() => import('pages/LandingPage'));
const Markets = lazy(() => import('pages/Markets/Home'));
const Market = lazy(() => import('pages/Markets/Market'));
const Rewards = lazy(() => import('pages/Rewards'));
const Quiz = lazy(() => import('pages/Quiz'));
const QuizLeaderboard = lazy(() => import('pages/Quiz/Leaderboard'));
const MintWorldCupNFT = lazy(() => import('pages/MintWorldCupNFT'));
const Vaults = lazy(() => import('pages/Vaults'));
const Vault = lazy(() => import('pages/Vault'));
const ParlayLeaderboard = lazy(() => import('pages/ParlayLeaderboard'));

const App = () => {
    const dispatch = useDispatch();
    const { trackPageView, trackEvent } = useMatomo();
    const networkId = useSelector((state) => getNetworkId(state));
    const isWalletConnected = useSelector((state) => getIsWalletConnected(state));
    const provider = useProvider({ chainId: networkId });
    const { address } = useAccount();
    const { data: signer } = useSigner();
    const client = useClient();

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
            const providerNetworkId = client.lastUsedChainId || (await getDefaultNetworkId());
            try {
                dispatch(updateNetworkSettings({ networkId: providerNetworkId }));
                networkConnector.setNetworkSettings({
                    networkId: providerNetworkId,
                    provider:
                        !!signer && !!signer.provider
                            ? new ethers.providers.Web3Provider(signer.provider.provider, 'any')
                            : window.ethereum
                            ? new ethers.providers.Web3Provider(window.ethereum, 'any')
                            : provider,
                    signer,
                });
                dispatch(setAppReady());
            } catch (e) {
                dispatch(setAppReady());
                console.log(e);
            }
        };
        init();
    }, [dispatch, provider, signer, client.lastUsedChainId, networkId]);

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
            window.ethereum.on('chainChanged', (chainId) => {
                dispatch(updateNetworkSettings({ networkId: parseInt(chainId, 16) }));
                if (window.ethereum.isMetaMask && !isWalletConnected) {
                    autoConnect();
                }
            });
        }
    }, [client, isWalletConnected, dispatch]);

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
                            <Route exact path={ROUTES.Leaderboard}>
                                <DappLayout>
                                    <ParlayLeaderboard />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Rewards}>
                                <DappLayout>
                                    <Rewards />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Profile}>
                                <DappLayout>
                                    <Profile />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Referral}>
                                <DappLayout>
                                    <Referral />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Wizard}>
                                <DappLayout>
                                    <Wizard />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Quiz}>
                                <DappLayout>
                                    <Quiz />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Vaults}>
                                <DappLayout>
                                    <Vaults />
                                </DappLayout>
                            </Route>
                            <Route
                                exact
                                path={ROUTES.Vault}
                                render={(routeProps) => (
                                    <DappLayout>
                                        <Vault {...routeProps} />
                                    </DappLayout>
                                )}
                            />
                            <Route exact path={ROUTES.QuizLeaderboard}>
                                <DappLayout>
                                    <QuizLeaderboard />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.MintWorldCupNFT}>
                                <DappLayout>
                                    <MintWorldCupNFT />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Home}>
                                <LandingPageLayout>
                                    <LandingPage />
                                </LandingPageLayout>
                            </Route>
                            <Route>
                                <Redirect to={ROUTES.Home} />
                                <LandingPageLayout>
                                    <LandingPage />
                                </LandingPageLayout>
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
