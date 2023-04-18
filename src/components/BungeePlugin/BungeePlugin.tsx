import { Bridge } from '@socket.tech/plugin';
import { COLLATERAL_INDEX_TO_COLLATERAL } from 'constants/currency';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { getDefaultCollateralIndexForNetworkId, Network } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import useAllSourceTokensQuery, { SOURCE_NETWORK_IDS } from './queries/useAllSourceTokensQuery';
import { NetworkId } from 'types/network';

type CustomizationProps = {
    width?: number;
    responsiveWidth?: boolean;
    borderRadius?: number;
    accent?: string;
    onAccent?: string;
    primary?: string;
    secondary?: string;
    text?: string;
    secondaryText?: string;
    interactive?: string;
    onInteractive?: string;
    outline?: string;
};

const SUPPORTED_DESTINATION_NETWORKS = [Network['Mainnet-Ovm'], Network.Arbitrum];

const BungeePlugin: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const apiKey = process.env.REACT_APP_BUNGEE_API_KEY || '';
    if (!apiKey) {
        console.error('Bungee API_KEY not found!');
    }

    const defaultSourceNetwork = Network.Mainnet;

    const destinationNetworks = SUPPORTED_DESTINATION_NETWORKS.includes(networkId)
        ? SUPPORTED_DESTINATION_NETWORKS.filter((id: number) => id === networkId)
        : SUPPORTED_DESTINATION_NETWORKS;
    const defaultDestNetwork = destinationNetworks[0];

    const allSourceTokensQuery = useAllSourceTokensQuery(apiKey, defaultDestNetwork, { enabled: isAppReady });
    const allTokens = allSourceTokensQuery.isSuccess && allSourceTokensQuery.data ? allSourceTokensQuery.data : [];

    const defaultSrcToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'; // native token
    const defaultDestinationToken = allTokens.filter(
        (token) =>
            token.chainId === defaultDestNetwork &&
            token.symbol ===
                COLLATERAL_INDEX_TO_COLLATERAL[
                    getDefaultCollateralIndexForNetworkId(defaultDestNetwork as NetworkId)
                ].toUpperCase() // SUSD is symbol on Bungee instead of sUSD
    )[0]?.address;

    // All colors should stricktly be in RGB format
    const customize: CustomizationProps = {
        width: isMobile ? 360 : 386, // 360 is min-width
        responsiveWidth: false,
        accent: 'rgb(95,97,128)', // button
        onAccent: 'rgb(255,255,255)', // button text
        primary: 'rgb(26,28,43)', // background
        secondary: 'rgb(81,84,111)', // main button wrapper
        text: 'rgb(255,255,255)',
        secondaryText: 'rgb(255,255,255)',
        interactive: 'rgb(26,28,43)', // dropdown
        onInteractive: 'rgb(255,255,255)', // dropdown text
        outline: 'rgb(95,97,128)',
    };

    return (
        <BungeeWrapper>
            <Bridge
                provider={networkConnector.signer?.provider}
                API_KEY={apiKey}
                sourceNetworks={SOURCE_NETWORK_IDS}
                defaultSourceNetwork={defaultSourceNetwork}
                destNetworks={destinationNetworks}
                defaultDestNetwork={defaultDestNetwork}
                tokenList={allTokens}
                defaultSourceToken={defaultSrcToken}
                defaultDestToken={defaultDestinationToken}
                customize={customize}
            />
        </BungeeWrapper>
    );
};

const BungeeWrapper = styled.div`
    box-sizing: border-box;
    position: relative;
    width: 386px;
    height: 463px;
    margin: auto;
    background: #1a1c2b;
    border-radius: 15px;
    outline: none;
    @media (max-width: 950px) {
        width: 360px;
    }
`;

export default BungeePlugin;
