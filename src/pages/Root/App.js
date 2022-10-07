import Loader from 'components/Loader';
import React, { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setAppReady } from 'redux/modules/app';
import { getNetworkId, updateNetworkSettings, updateWallet } from 'redux/modules/wallet';
import { getDefaultNetworkId } from 'utils/network';
import queryConnector from 'utils/queryConnector';
import { history } from 'utils/routes';
import networkConnector from 'utils/networkConnector';
import ROUTES from 'constants/routes';
import Theme from 'layouts/Theme';
import DappLayout from 'layouts/DappLayout';
import { useMatomo } from '@datapunt/matomo-tracker-react';
import { useAccount, useProvider, useSigner } from 'wagmi';
import BannerCarousel from 'components/BannerCarousel';
import { ethers } from 'ethers';

const Markets = lazy(() => import('pages/Markets/Home'));
const Market = lazy(() => import('pages/Markets/Market'));
const Rewards = lazy(() => import('pages/Rewards'));
const Quiz = lazy(() => import('pages/Quiz'));
const QuizLeaderboard = lazy(() => import('pages/Quiz/Leaderboard'));

const App = () => {
    const dispatch = useDispatch();
    const { trackPageView } = useMatomo();
    const networkId = useSelector((state) => getNetworkId(state));
    const provider = useProvider();
    const { address } = useAccount();
    const { data: signer } = useSigner();

    queryConnector.setQueryClient();

    useEffect(() => {
        const init = async () => {
            const providerNetworkId = await getDefaultNetworkId();
            try {
                dispatch(updateNetworkSettings({ networkId: providerNetworkId }));
                networkConnector.setNetworkSettings({
                    networkId: providerNetworkId,
                    provider:
                        !!signer && !!signer.provider
                            ? new ethers.providers.Web3Provider(signer.provider.provider, 'any')
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
    }, [dispatch, networkId, provider, signer]);

    useEffect(() => {
        dispatch(updateWallet({ walletAddress: address }));
    }, [address, dispatch]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', (chainId) => {
                dispatch(updateNetworkSettings({ networkId: parseInt(chainId, 16) }));
            });
        }
    }, [dispatch]);

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
                            <Route exact path={ROUTES.Home}>
                                <Redirect to={ROUTES.Markets.Home} />
                                {/*<HomeLayout />*/}
                            </Route>
                            <Route exact path={ROUTES.Rewards}>
                                <DappLayout>
                                    <Rewards />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Quiz}>
                                <DappLayout>
                                    <Quiz />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.QuizLeaderboard}>
                                <DappLayout>
                                    <QuizLeaderboard />
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
