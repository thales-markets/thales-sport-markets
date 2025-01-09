import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Buffer as buffer } from 'buffer';
import UnexpectedError from 'components/UnexpectedError';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { PLAUSIBLE } from 'constants/analytics';
import { ThemeMap } from 'constants/ui';
import { merge } from 'lodash';
import App from 'pages/Root/App';
import React, { ErrorInfo } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { getDefaultTheme } from 'redux/modules/ui';
import { logErrorToDiscord } from 'utils/discord';
import { PARTICLE_STYLE } from 'utils/particleWallet/utils';
import queryConnector from 'utils/queryConnector';
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

const isDeployError = (errorMessage: string) =>
    errorMessage &&
    (errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Importing a module script failed') ||
        errorMessage.includes("'text/html' is not a valid JavaScript MIME type"));

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

        if (isDeployError(error.message)) {
            console.log('Deployment error', error, info);
            return;
        }

        logErrorToDiscord(error, info);
    };

    const fallbackRender = ({ error, resetErrorBoundary }: FallbackProps) => {
        if (isDeployError(error.message)) {
            resetErrorBoundary();
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
