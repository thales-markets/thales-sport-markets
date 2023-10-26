import Loader from 'components/Loader';
import React, { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setAppReady, setMobileState } from 'redux/modules/app';
import {
    getNetworkId,
    updateNetworkSettings,
    switchToNetworkId,
    updateWallet,
    getSwitchToNetworkId,
} from 'redux/modules/wallet';
import queryConnector from 'utils/queryConnector';
import { history } from 'utils/routes';
import networkConnector from 'utils/networkConnector';
import { isNetworkSupported, isRouteAvailableForNetwork } from 'utils/network';
import ROUTES from 'constants/routes';
import Theme from 'layouts/Theme';
import DappLayout from 'layouts/DappLayout';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useAccount, useProvider, useSigner, useDisconnect, useNetwork, mainnet } from 'wagmi';
import LandingPageLayout from 'layouts/LandingPageLayout';
import BannerCarousel from 'components/BannerCarousel';
import { isMobile } from 'utils/device';
import Profile from 'pages/Profile';
import Wizard from 'pages/Wizard';
import Referral from 'pages/Referral';
import { buildHref } from 'utils/routes';
import { SUPPORTED_NETWORKS_NAMES } from 'constants/network';
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { Bundler } from '@biconomy/bundler';
import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy/modules';
import { ethers } from 'ethers';
import { ParticleNetwork } from '@particle-network/auth';
import { ParticleProvider } from '@particle-network/provider';
import biconomyConnector from 'utils/biconomyWallet';
import { BiconomyPaymaster } from '@biconomy/paymaster';

const LandingPage = lazy(() => import('pages/LandingPage'));
const Markets = lazy(() => import('pages/Markets/Home'));
const Market = lazy(() => import('pages/Markets/Market'));
const Quiz = lazy(() => import('pages/Quiz'));
const QuizLeaderboard = lazy(() => import('pages/Quiz/Leaderboard'));
const Vaults = lazy(() => import('pages/Vaults'));
const Vault = lazy(() => import('pages/Vault'));
const ParlayLeaderboard = lazy(() => import('pages/ParlayLeaderboard'));
const LiquidityPool = lazy(() => import('pages/LiquidityPool'));

const particle = new ParticleNetwork({
    projectId: '', // todo
    clientKey: '', // todo
    appId: '', // todo
    chainName: 'arbitrum', //optional: current chain name, default Ethereum.
    chainId: 42161, //optional: current chain id, default 1.
    wallet: {
        //optional: by default, the wallet entry is displayed in the bottom right corner of the webpage.
        displayWalletEntry: true, //show wallet entry when connect particle.
        uiMode: 'dark', //optional: light or dark, if not set, the default is the same as web auth.
        supportChains: [
            { id: 10, name: 'optimism' },
            { id: 42161, name: 'arbitrum' },
            { id: 420, name: 'optimism' },
            { id: 84531, name: 'base' },
        ], // optional: web wallet support chains.
        customStyle: {}, //optional: custom wallet style
    },
});

const App = () => {
    const dispatch = useDispatch();
    const { trackPageView, trackEvent } = useMatomo();
    const networkId = useSelector((state) => getNetworkId(state));
    const switchedToNetworkId = useSelector((state) => getSwitchToNetworkId(state));

    const { address } = useAccount();
    const provider = useProvider(!address && { chainId: switchedToNetworkId }); // when wallet not connected force chain
    const { data: signer } = useSigner();
    const { disconnect } = useDisconnect();
    const { chain } = useNetwork();

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
            try {
                const chainIdFromProvider = (await provider.getNetwork()).chainId;
                const providerNetworkId = !!address ? chainIdFromProvider : switchedToNetworkId;
                let web3Provider;

                if (particle.auth.isLogin()) {
                    const particleProvider = new ParticleProvider(particle.auth);
                    const chainId = (await provider.getNetwork()).chainId;
                    console.log('chainId: ', chainId);
                    const bundler = new Bundler({
                        // get from biconomy dashboard https://dashboard.biconomy.io/
                        bundlerUrl: ``, // todo
                        chainId: (await provider.getNetwork()).chainId, // or any supported chain of your choice
                        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
                    });

                    const paymaster = new BiconomyPaymaster({
                        paymasterUrl: '', // todo
                    });

                    web3Provider = new ethers.providers.Web3Provider(particleProvider, 'any');

                    const module = await ECDSAOwnershipValidationModule.create({
                        signer: web3Provider.getSigner(),
                        moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
                    });

                    const account = await BiconomySmartAccountV2.create({
                        chainId,
                        bundler,
                        provider,
                        paymaster,
                        entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
                        defaultValidationModule: module,
                        activeValidationModule: module,
                    });
                    const wallet = await account.init();

                    const swAddress = await wallet.getAccountAddress();
                    const isDeployed = await wallet.isAccountDeployed(swAddress);
                    console.log('swAddress: ', swAddress, 'isDeployed: ', isDeployed);
                    biconomyConnector.setWallet(wallet);
                    dispatch(updateWallet({ walletAddress: swAddress }));
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
                    <ReactQueryDevtools initialIsOpen={false} />
                </Suspense>
            </QueryClientProvider>
        </Theme>
    );
};

export default App;
