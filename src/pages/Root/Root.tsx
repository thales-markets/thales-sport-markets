import { PLAUSIBLE } from 'constants/analytics';
import dotenv from 'dotenv';
import App from 'pages/Root/App';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import WagmiProvider from './Provider/WagmiProvider';

dotenv.config();

type RootProps = {
    store: Store;
};

const Root: React.FC<RootProps> = ({ store }) => {
    PLAUSIBLE.enableAutoPageviews();

    return (
        <Provider store={store}>
            <WagmiProvider>
                <App />
            </WagmiProvider>
        </Provider>
    );
};

export default Root;
