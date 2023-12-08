import { ParticleNetwork } from '@particle-network/auth';
import React, { createContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getNetworkNameByNetworkId } from 'utils/network';

export const ParticleContext = createContext<ParticleNetwork | null>(null);

type ParticleProvider = {
    children: JSX.Element;
};

const ParticleProvider: React.FC<ParticleProvider> = ({ children }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    console.log('------------------ ParticleProvider ------------------');
    console.log('networkId ParticleProvider', networkId);
    console.log('------------------ ParticleProvider ------------------');

    const particle = useMemo(() => {
        return new ParticleNetwork({
            projectId: process.env.REACT_APP_PARTICLE_PROJECT_ID as string,
            clientKey: process.env.REACT_APP_CLIENT_KEY as string,
            appId: process.env.REACT_APP_PARTICLE_APP_ID as string,
            chainName: getNetworkNameByNetworkId(networkId, true), //optional
            chainId: networkId, //optional
            wallet: {
                //optional: by default, the wallet entry is displayed in the bottom right corner of the webpage.
                displayWalletEntry: false, //show wallet entry when connect particle.
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
    }, [networkId]);

    return <ParticleContext.Provider value={particle}>{children}</ParticleContext.Provider>;
};

export default ParticleProvider;
