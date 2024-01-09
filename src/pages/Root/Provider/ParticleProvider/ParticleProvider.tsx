import { ParticleNetwork } from '@particle-network/auth';
import { Network } from 'enums/network';
import React, { createContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import { getNetworkNameByNetworkId } from 'utils/network';

export const ParticleContext = createContext<ParticleNetwork | undefined>(undefined);

type ParticleProviderProps = {
    children: JSX.Element;
};

const ParticleProvider: React.FC<ParticleProviderProps> = ({ children }) => {
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const particle = useMemo(() => {
        try {
            return new ParticleNetwork({
                projectId: process.env.REACT_APP_PARTICLE_PROJECT_ID as string,
                clientKey: process.env.REACT_APP_CLIENT_KEY as string,
                appId: process.env.REACT_APP_PARTICLE_APP_ID as string,
                chainName: getNetworkNameByNetworkId(networkId, true)?.toLowerCase() || 'optimism',
                chainId: networkId || 10,
                wallet: {
                    //optional: by default, the wallet entry is displayed in the bottom right corner of the webpage.
                    displayWalletEntry: false, //show wallet entry when connect particle.
                    uiMode: 'dark', //optional: light or dark, if not set, the default is the same as web auth.
                    supportChains: [
                        { id: Network.OptimismMainnet, name: 'optimism' },
                        { id: Network.Arbitrum, name: 'arbitrum' },
                        { id: Network.Base, name: 'base' },
                        { id: Network.OptimismGoerli, name: 'optimism' },
                    ], // optional: web wallet support chains.
                    customStyle: {}, //optional: custom wallet style
                },
            });
        } catch (e) {
            console.log('E ', e);
            return undefined;
        }
    }, [networkId]);
    return <ParticleContext.Provider value={particle}>{children}</ParticleContext.Provider>;
};

export default ParticleProvider;
