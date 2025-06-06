import ArbitrumLogo from 'assets/images/arbitrum-logo.svg?react';
import OPLogo from 'assets/images/optimism-logo.svg?react';
import Tooltip from 'components/Tooltip';
import { INCENTIVIZED_LEAGUES } from 'constants/markets';
import { Network } from 'enums/network';
import { League } from 'overtime-utils';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useChainId } from 'wagmi';

type IncentivizedLeagueProps = {
    league: League;
    fontSize?: number;
    maturityDate?: Date;
    onlyLogo?: boolean;
};

const IncentivizedLeague: React.FC<IncentivizedLeagueProps> = ({ league, maturityDate, fontSize, onlyLogo }) => {
    const { t } = useTranslation();

    const networkId = useChainId();

    const incentivizedLeague = INCENTIVIZED_LEAGUES[league];
    const rewards = incentivizedLeague
        ? incentivizedLeague.rewards[incentivizedLeague.showOnAllNetworks || networkId]
        : '';

    const date = maturityDate || new Date();

    return (
        <>
            {incentivizedLeague &&
                date > incentivizedLeague.startDate &&
                date < incentivizedLeague.endDate &&
                (incentivizedLeague.availableOnNetworks.includes(networkId) ||
                    !!incentivizedLeague.showOnAllNetworks) && (
                    <Tooltip
                        overlay={
                            <Trans
                                i18nKey={incentivizedLeague.tooltipKey}
                                components={{
                                    detailsLink: <a href={incentivizedLeague.link} target="_blank" rel="noreferrer" />,
                                }}
                                values={{
                                    rewards,
                                }}
                            />
                        }
                    >
                        <Container onlyLogo={onlyLogo}>
                            {!onlyLogo && <Title fontSize={fontSize}>{t('markets.incentivized-markets')}</Title>}
                            {getNetworkLogo(incentivizedLeague.showOnAllNetworks || networkId)}
                        </Container>
                    </Tooltip>
                )}
        </>
    );
};

const getNetworkLogo = (networkId: number) => {
    switch (networkId) {
        case Network.OptimismMainnet:
            return <OPLogo />;
        case Network.Arbitrum:
            return <ArbitrumLogo />;
        default:
            return <></>;
    }
};

const Container = styled.div<{ onlyLogo?: boolean }>`
    display: flex;
    align-items: center;
    cursor: pointer;
    margin-left: ${(props) => (props.onlyLogo ? 5 : 0)}px;
    svg {
        height: ${(props) => (props.onlyLogo ? 18 : 21)}px;
    }
`;

const Title = styled.span<{ fontSize?: number }>`
    font-size: ${(props) => props.fontSize || 13}px;
    padding-right: 5px;
    text-align: right;
    margin-bottom: -2px;
`;

export default IncentivizedLeague;
