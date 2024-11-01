import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import UnexpectedError from 'components/UnexpectedError';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { PLAUSIBLE } from 'constants/analytics';
import { ThemeMap } from 'constants/ui';
import dotenv from 'dotenv';
import { merge } from 'lodash';
import App from 'pages/Root/App';
import React, { ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { getDefaultTheme } from 'redux/modules/ui';
import { PARTICLE_STYLE } from 'utils/particleWallet/utils';
import queryConnector from 'utils/queryConnector';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './wagmiConfig';

dotenv.config();

type RootProps = {
    store: Store;
};

const theme = getDefaultTheme();
const rainbowCustomTheme = merge(darkTheme(), {
    colors: {
        accentColor: ThemeMap[theme].textColor.primary,
        accentColorForeground: ThemeMap[theme].button.textColor.secondary,
        modalBackground: ThemeMap[theme].background.primary,
        modalBorder: ThemeMap[theme].borderColor.primary,
        profileForeground: ThemeMap[theme].background.primary,
        closeButton: ThemeMap[theme].button.textColor.tertiary,
        closeButtonBackground: ThemeMap[theme].button.background.primary,
        actionButtonBorder: 'transparent',
    },
    shadows: { dialog: ThemeMap[theme].borderColor.primary },
    radii: { menuButton: '8px' },
});

queryConnector.setQueryClient();

const Root: React.FC<RootProps> = ({ store }) => {
    PLAUSIBLE.enableAutoPageviews();

    const logError = (error: Error, info: ErrorInfo) => {
        // if (import.meta.env.DEV) {
        //     return;
        // }

        // let content = `IsMobile:${isMobile()}\nError:\n${error.stack || error.message}`;
        // const flags = 4; // SUPPRESS_EMBEDS
        // fetch(LINKS.Discord.SpeedErrors, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ content, flags }),
        // });

        // content = `ErrorInfo:${info.componentStack}`;
        // if (content.length > DISCORD_MESSAGE_MAX_LENGTH) {
        //     content = content.substring(0, DISCORD_MESSAGE_MAX_LENGTH);
        // }
        // fetch(LINKS.Discord.SpeedErrors, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ content, flags }),
        // });
        console.error(error, info);
    };

    return (
        <ErrorBoundary fallback={<UnexpectedError theme={ThemeMap[theme]} />} onError={logError}>
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
