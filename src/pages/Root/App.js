import { loadProvider } from '@synthetixio/providers';
import Loader from 'components/Loader';
import { initOnboard } from 'config/onboard';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import useLocalStorage from 'hooks/useLocalStorage';
import React, { lazy, Suspense, useEffect } from 'react';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Router, Switch } from 'react-router-dom';
import { getIsAppReady, setAppReady } from 'redux/modules/app';
import { getNetworkId, updateNetworkSettings, updateWallet } from 'redux/modules/wallet';
import { getDefaultNetworkId, isNetworkSupported } from 'utils/network';
import onboardConnector from 'utils/onboardConnector';
import queryConnector from 'utils/queryConnector';
import { history } from 'utils/routes';
import networkConnector from 'utils/networkConnector';
import ROUTES from 'constants/routes';
import Theme from 'layouts/Theme';
import DappLayout from 'layouts/DappLayout';
import HomeLayout from 'layouts/HomeLayout';
import { useMatomo } from '@datapunt/matomo-tracker-react';

const Markets = lazy(() => import('pages/Markets/Home'));
const Market = lazy(() => import('pages/Markets/Market'));

const App = () => {
    const dispatch = useDispatch();
    const { trackPageView } = useMatomo();
    const isAppReady = useSelector((state) => getIsAppReady(state));
    const [selectedWallet, setSelectedWallet] = useLocalStorage(LOCAL_STORAGE_KEYS.SELECTED_WALLET, '');
    const networkId = useSelector((state) => getNetworkId(state));

    queryConnector.setQueryClient();

    useEffect(() => {
        const init = async () => {
            const networkId = await getDefaultNetworkId();
            try {
                dispatch(updateNetworkSettings({ networkId }));
                if (!networkConnector.initialized) {
                    const provider = loadProvider({
                        networkId,
                        infuraId: process.env.REACT_APP_INFURA_PROJECT_ID,
                        provider: window.ethereum,
                    });

                    networkConnector.setNetworkSettings({ networkId, provider });
                }
                dispatch(setAppReady());
            } catch (e) {
                dispatch(setAppReady());
                console.log(e);
            }
        };

        init();
    }, []);

    useEffect(() => {
        if (isAppReady && networkId && isNetworkSupported(networkId)) {
            const onboard = initOnboard(networkId, {
                address: (walletAddress) => {
                    if (walletAddress) {
                        dispatch(updateWallet({ walletAddress }));
                    }
                },
                network: (networkId) => {
                    if (networkId) {
                        if (isNetworkSupported(networkId)) {
                            if (onboardConnector.onboard.getState().wallet.provider) {
                                const provider = loadProvider({
                                    provider: onboardConnector.onboard.getState().wallet.provider,
                                });
                                const signer = provider.getSigner();

                                networkConnector.setNetworkSettings({
                                    networkId,
                                    provider,
                                    signer,
                                });
                            } else {
                                networkConnector.setNetworkSettings({ networkId });
                            }

                            onboardConnector.onboard.config({ networkId });
                        }
                        dispatch(updateNetworkSettings({ networkId }));
                    }
                },
                wallet: async (wallet) => {
                    if (wallet.provider) {
                        const provider = loadProvider({
                            provider: wallet.provider,
                        });
                        const signer = provider.getSigner();
                        const network = await provider.getNetwork();
                        const networkId = network.chainId;
                        networkConnector.setNetworkSettings({
                            networkId,
                            provider,
                            signer,
                        });
                        setSelectedWallet(wallet.name);
                        dispatch(updateNetworkSettings({ networkId }));
                    } else {
                        dispatch(updateWallet({ walletAddress: null }));
                        setSelectedWallet(null);
                    }
                },
            });
            onboardConnector.setOnBoard(onboard);
        }
    }, [isAppReady]);

    // load previously saved wallet
    useEffect(() => {
        if (onboardConnector.onboard && selectedWallet) {
            onboardConnector.onboard.walletSelect(selectedWallet);
        }
    }, [isAppReady, onboardConnector.onboard, selectedWallet]);

    useEffect(() => {
        trackPageView();
    }, []);

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
                                <DappLayout showSearch>
                                    <Markets />
                                </DappLayout>
                            </Route>
                            <Route exact path={ROUTES.Home}>
                                <HomeLayout />
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
