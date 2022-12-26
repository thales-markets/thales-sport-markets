import { Bridge } from '@socket.tech/plugin';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import styled from 'styled-components';
import { Network } from 'utils/network';
import networkConnector from 'utils/networkConnector';
import useAllSourceTokensQuery, { SOURCE_NETWORK_IDS } from './queries/useAllSourceTokensQuery';
import { destinationTokens } from './tokens';

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

const BungeePlugin: React.FC = () => {
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const apiKey = process.env.REACT_APP_BUNGEE_API_KEY || '';
    if (!apiKey) {
        console.error('Bungee API_KEY not found!');
    }

    const defaultSourceNetwork = Network.Mainnet;
    const destinationNetworks = [Network['Mainnet-Ovm']];
    const defaultDestNetwork = Network['Mainnet-Ovm'];

    const allSourceTokensQuery = useAllSourceTokensQuery(apiKey, defaultDestNetwork, { enabled: isAppReady });
    const sourceTokens = allSourceTokensQuery.isSuccess && allSourceTokensQuery.data ? allSourceTokensQuery.data : [];

    const tokenList = [...sourceTokens, ...destinationTokens];

    const defaultDestinationToken = destinationTokens.filter(
        (token) => token.chainId === Network['Mainnet-Ovm'] && token.symbol === CRYPTO_CURRENCY_MAP.sUSD
    )[0].address;

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
                provider={networkConnector.provider}
                API_KEY={apiKey}
                sourceNetworks={SOURCE_NETWORK_IDS}
                defaultSourceNetwork={defaultSourceNetwork}
                destNetworks={destinationNetworks}
                defaultDestNetwork={defaultDestNetwork}
                tokenList={tokenList}
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
