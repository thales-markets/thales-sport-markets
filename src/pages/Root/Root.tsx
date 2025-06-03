import { AuthCoreContextProvider } from '@particle-network/authkit';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import UnexpectedError from 'components/UnexpectedError';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { PLAUSIBLE } from 'constants/analytics';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ThemeMap } from 'constants/ui';
import { differenceInSeconds } from 'date-fns';
import { merge } from 'lodash';
import App from 'pages/Root/App';
import React, { ErrorInfo } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { getDefaultTheme } from 'redux/modules/ui';
import { localStore } from 'thales-utils';
import { isDeployError, logErrorToDiscord } from 'utils/discord';
import { PARTICLE_STYLE } from 'utils/particleWallet/utils';
import queryConnector from 'utils/queryConnector';
import { arbitrum, base, optimism, optimismSepolia } from 'viem/chains';
import { WagmiProvider } from 'wagmi';
import enTranslation from '../../i18n/en.json';
import { wagmiConfig } from './wagmiConfig';

// window.Buffer = window.Buffer || buffer; // Fix for Particle Wallets

type RootProps = {
    store: Store;
};

const theme = getDefaultTheme();
const rainbowCustomTheme = merge(darkTheme(), {
    colors: {
        modalBackground: ThemeMap[theme].background.secondary,
    },
    shadows: { dialog: ThemeMap[theme].borderColor.primary },
    radii: { menuButton: '8px' },
});

queryConnector.setQueryClient();

const PREVENT_ERROR_RELOAD_THRESHOLD_SECONDS = 10;

const Root: React.FC<RootProps> = ({ store }) => {
    // particle context provider is overriding our i18n configuration and languages, so we need to add our localization after the initialization of particle context
    // initialization of particle context is happening in Root
    const { i18n } = useTranslation();
    i18n.addResourceBundle('en', 'translation', enTranslation, true);

    PLAUSIBLE.enableAutoPageviews();

    const onErrorHandler = (error: Error, info: ErrorInfo) => {
        if (import.meta.env.DEV) {
            return;
        }

        if (isDeployError(error.stack || error.message)) {
            console.log('Deployment error', error, info);
            return;
        }

        logErrorToDiscord(error, info);
    };

    const fallbackRender = ({ error, resetErrorBoundary }: FallbackProps) => {
        const reloadedTimeSec = Number(localStore.get(LOCAL_STORAGE_KEYS.ERROR_RELOAD_TIME) || 0);
        const preventReload = differenceInSeconds(Date.now(), reloadedTimeSec) < PREVENT_ERROR_RELOAD_THRESHOLD_SECONDS;

        if (preventReload) {
            logErrorToDiscord(error, { componentStack: 'Reload loop prevented!' });
        } else if (isDeployError(error.stack || error.message)) {
            resetErrorBoundary();
            localStore.set(LOCAL_STORAGE_KEYS.ERROR_RELOAD_TIME, Date.now());
            window.location.reload();
            return;
        }

        return <UnexpectedError theme={ThemeMap[theme]} />;
    };

    return (
        <ErrorBoundary fallbackRender={fallbackRender} onError={onErrorHandler}>
            <QueryClientProvider client={queryConnector.queryClient}>
                <Provider store={store}>
                    <AuthCoreContextProvider
                        options={{
                            projectId: import.meta.env.VITE_APP_PARTICLE_PROJECT_ID,
                            clientKey: import.meta.env.VITE_APP_PARTICLE_CLIENT_KEY,
                            appId: import.meta.env.VITE_APP_PARTICLE_API_ID,
                            language: 'en',
                            wallet: {
                                visible: false,
                            },
                            chains: [optimism, arbitrum, base, optimismSepolia],
                            themeType: 'dark',
                            customStyle: PARTICLE_STYLE,
                        }}
                    >
                        <WagmiProvider config={wagmiConfig}>
                            <RainbowKitProvider
                                theme={rainbowCustomTheme}
                                appInfo={{
                                    appName: 'OvertimeMarkets',
                                    disclaimer: WalletDisclaimer,
                                }}
                            >
                                <App />
                            </RainbowKitProvider>
                        </WagmiProvider>
                    </AuthCoreContextProvider>
                </Provider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default Root;
