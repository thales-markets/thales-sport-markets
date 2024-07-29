import { Bridge } from '@socket.tech/plugin';
import { Network } from 'enums/network';
import { ethers } from 'ethers';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { hexToRGB } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { ThemeInterface } from 'types/ui';
import { getDefaultCollateral } from 'utils/collaterals';
import networkConnector from 'utils/networkConnector';
import { mainnet, useNetwork } from 'wagmi';
import useAllSourceTokensQuery, { SOURCE_NETWORK_IDS } from './queries/useAllSourceTokensQuery';

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

const SUPPORTED_DESTINATION_NETWORKS = [Network.OptimismMainnet, Network.Arbitrum, Network.Base];

const BungeePlugin: React.FC = () => {
    const { chain } = useNetwork();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const apiKey = import.meta.env.VITE_APP_BUNGEE_API_KEY || '';
    if (!apiKey) {
        console.error('Bungee API_KEY not found!');
    }

    const defaultSourceNetwork = mainnet.id;

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
            token.symbol === getDefaultCollateral(defaultDestNetwork as SupportedNetwork).toUpperCase() // SUSD is symbol on Bungee instead of sUSD
    )[0]?.address;

    // All colors should stricktly be in RGB format
    const customize: CustomizationProps = {
        width: isMobile ? 360 : 386, // 360 is min-width
        responsiveWidth: false,
        accent: hexToRGB(theme.button.background.primary), // button
        onAccent: hexToRGB(theme.button.textColor.secondary), // button text
        primary: hexToRGB(theme.background.primary), // background
        secondary: hexToRGB(theme.button.background.tertiary), // main button wrapper
        text: hexToRGB(theme.textColor.primary),
        secondaryText: hexToRGB(theme.textColor.primary),
        interactive: hexToRGB(theme.background.primary), // dropdown
        onInteractive: hexToRGB(theme.textColor.primary), // dropdown text
        outline: hexToRGB(theme.button.background.primary),
    };

    return (
        <BungeeWrapper>
            <Bridge
                provider={
                    chain?.id === mainnet.id
                        ? new ethers.providers.Web3Provider(window.ethereum as any, 'any') // mainnet is not supported network, so read provider from browser wallet
                        : networkConnector.signer?.provider
                }
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
    background: ${(props) => props.theme.background.primary};
    border-radius: 15px;
    outline: none;
    @media (max-width: 950px) {
        width: 360px;
    }
`;

export default BungeePlugin;
