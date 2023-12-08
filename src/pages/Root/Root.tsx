import '@rainbow-me/rainbowkit/dist/index.css';
import { PLAUSIBLE } from 'constants/analytics';
import dotenv from 'dotenv';
import React from 'react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import App from './App';
import ParticleProvider from './Provider/ParticleProvider/ParticleProvider';
import WagmiProvider from './Provider/WagmiProvider';

dotenv.config();

type RootProps = {
    store: Store;
};

const Root: React.FC<RootProps> = ({ store }) => {
    PLAUSIBLE.enableAutoPageviews();

    return (
        <Provider store={store}>
            <ParticleProvider>
                <WagmiProvider>
                    <App />
                </WagmiProvider>
            </ParticleProvider>
        </Provider>
    );
};

export default Root;
