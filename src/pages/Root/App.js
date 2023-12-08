import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy/account';
import { Bundler } from '@biconomy/bundler';
import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy/modules';
import { BiconomyPaymaster } from '@biconomy/paymaster';
import { ParticleProvider } from '@particle-network/provider';
import BannerCarousel from 'components/BannerCarousel';
import Loader from 'components/Loader';
import { SUPPORTED_NETWORKS_NAMES } from 'constants/network';
import ROUTES from 'constants/routes';
import { ethers } from 'ethers';
import DappLayout from 'layouts/DappLayout';
import LandingPageLayout from 'layouts/LandingPageLayout';
import Theme from 'layouts/Theme';
import Profile from 'pages/Profile';
import Referral from 'pages/Referral';
import Wizard from 'pages/Wizard';
import { Suspense, lazy, useContext, useEffect } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setAppReady, setMobileState } from 'redux/modules/app';
import {
    getIsAA,
    getNetworkId,
    getSwitchToNetworkId,
    switchToNetworkId,
    updateAAStatus,
    updateNetworkSettings,
    updateWallet,
} from 'redux/modules/wallet';
import biconomyConnector from 'utils/biconomyWallet';
import { isMobile } from 'utils/device';
import { isNetworkSupported, isRouteAvailableForNetwork } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import queryConnector from 'utils/queryConnector';
import { buildHref, history } from 'utils/routes';
import { mainnet, useAccount, useDisconnect, useNetwork, useProvider, useSigner } from 'wagmi';
import { ParticleContext } from './Provider/ParticleProvider/ParticleProvider';
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
const Deposit = lazy(() => import('pages/AARelatedPages/Deposit'));
const Withdraw = lazy(() => import('pages/AARelatedPages/Withdraw'));
const GetStarted = lazy(() => import('pages/AARelatedPages/GetStarted'));

const App = () => {
    const particle = useContext(ParticleContext);

    const dispatch = useDispatch();
    const networkId = useSelector((state) => getNetworkId(state));
    const switchedToNetworkId = useSelector((state) => getSwitchToNetworkId(state));
    const isAA = useSelector((state) => getIsAA(state));

    const { address } = useAccount();
    const provider = useProvider(!address && { chainId: switchedToNetworkId }); // when wallet not connected force chain
    const { data: signer } = useSigner();
    const { disconnect } = useDisconnect();
    const { chain } = useNetwork();

    queryConnector.setQueryClient();

    useEffect(() => {
        const init = async () => {
            try {
                console.log('--------------------- Init App.js ------------------------');
                const chainIdFromProvider = (await provider.getNetwork()).chainId;
                const providerNetworkId = !!address ? chainIdFromProvider : switchedToNetworkId;

                console.log('chainIdFromProvider ', chainIdFromProvider);
                console.log('providerNetworkId ', providerNetworkId);

                dispatch(
                    updateNetworkSettings({
                        networkId: providerNetworkId,
                        networkName: SUPPORTED_NETWORKS_NAMES[providerNetworkId]?.toLowerCase(),
                    })
                );
                dispatch(setAppReady());
                console.log('--------------------- Init App.js ------------------------');
            } catch (e) {
                dispatch(setAppReady());
                console.log(e);
            }
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, particle]);

    useEffect(() => {
        const init = async () => {
            console.log('-------------- Init particle useEffect --------------');
            const chainIdFromProvider = (await provider.getNetwork()).chainId;
            const providerNetworkId = !!address ? chainIdFromProvider : switchedToNetworkId;
            let web3Provider;

            console.log('chainIdFromProvider from par -> ', chainIdFromProvider);
            console.log('providerNetworkId from par -> ', providerNetworkId);

            if (particle && particle.auth.isLogin()) {
                console.log('Ulazi u islogin');
                const userInfo = particle.auth.getUserInfo();
                const particleProvider = new ParticleProvider(particle.auth);
                const chainId = (await provider.getNetwork()).chainId;
                const bundler = new Bundler({
                    // get from biconomy dashboard https://dashboard.biconomy.io/
                    bundlerUrl: `https://bundler.biconomy.io/api/v2/${chainId}/${process.env.REACT_APP_BICONOMY_BUNDLE_KEY}`,
                    chainId: (await provider.getNetwork()).chainId, // or any supported chain of your choice
                    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
                });

                const paymaster = new BiconomyPaymaster({
                    paymasterUrl: `https://paymaster.biconomy.io/api/v1/${chainId}/${
                        process.env['REACT_APP_PAYMASTER_KEY_' + chainId]
                    }`,
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

                const swAddress = await account.getAccountAddress();
                biconomyConnector.setWallet(account);
                biconomyConnector.setUserInfo(userInfo);
                dispatch(updateWallet({ walletAddress: swAddress }));
            }

            networkConnector.setNetworkSettings({
                networkId: providerNetworkId,
                provider,
                signer: web3Provider ? web3Provider.getSigner() : signer,
            });
            console.log('-------------- Init particle useEffect --------------');
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, particle, provider, signer, address]);

    useEffect(() => {
        !particle?.auth.isLogin() && dispatch(updateWallet({ walletAddress: address }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, particle?.auth.isLogin()]);

    useEffect(() => {
        console.log('update is AA ', particle?.auth.isLogin());
        dispatch(updateAAStatus({ isAA: particle?.auth?.isLogin() ? true : false }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, particle?.auth.isLogin()]);

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
            console.log('Disconnect');
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

                                {isAA && (
                                    <Route exact path={ROUTES.Deposit}>
                                        <DappLayout>
                                            <Deposit />
                                        </DappLayout>
                                    </Route>
                                )}
                                {isAA && (
                                    <Route exact path={ROUTES.Withdraw}>
                                        <DappLayout>
                                            <Withdraw />
                                        </DappLayout>
                                    </Route>
                                )}
                                <Route exact path={ROUTES.Wizard}>
                                    <DappLayout>
                                        {isAA && <GetStarted />}
                                        {!isAA && <Wizard />}
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
