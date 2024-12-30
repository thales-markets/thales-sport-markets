import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Buffer as buffer } from 'buffer';
import UnexpectedError from 'components/UnexpectedError';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { PLAUSIBLE } from 'constants/analytics';
import ROUTES from 'constants/routes';
import { ThemeMap } from 'constants/ui';
import { merge } from 'lodash';
import App from 'pages/Root/App';
import React, { ErrorInfo } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { getDefaultTheme } from 'redux/modules/ui';
import { logError } from 'utils/discord';
import { PARTICLE_STYLE } from 'utils/particleWallet/utils';
import queryConnector from 'utils/queryConnector';
import { navigateTo } from 'utils/routes';
import { WagmiProvider } from 'wagmi';
import enTranslation from '../../i18n/en.json';
import { wagmiConfig } from './wagmiConfig';

window.Buffer = window.Buffer || buffer;

type RootProps = {
    store: Store;
};

const theme = getDefaultTheme();
const rainbowCustomTheme = merge(darkTheme(), {
    colors: {
        modalBackground: ThemeMap[theme].background.primary,
    },
    shadows: { dialog: ThemeMap[theme].borderColor.primary },
    radii: { menuButton: '8px' },
});

queryConnector.setQueryClient();

const Root: React.FC<RootProps> = ({ store }) => {
    // particle context provider is overriding our i18n configuration and languages, so we need to add our localization after the initialization of particle context
    // initialization of particle context is happening in Root
    const { i18n } = useTranslation();
    i18n.addResourceBundle('en', 'translation', enTranslation, true);

    PLAUSIBLE.enableAutoPageviews();

    const { resetBoundary } = useErrorBoundary();

    const onErrorHandler = (error: Error, info: ErrorInfo) => {
        if (import.meta.env.DEV) {
            return;
        }

        const isDeployError =
            error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('Importing a module script failed');

        if (isDeployError) {
            console.log('Deployment error:', error, info);
            resetBoundary();
            navigateTo(ROUTES.Markets.Home);
        } else {
            logError(error, info);
        }
    };

    return (
        <ErrorBoundary fallback={<UnexpectedError theme={ThemeMap[theme]} />} onError={onErrorHandler}>
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
