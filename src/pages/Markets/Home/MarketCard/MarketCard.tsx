import React from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { isClaimAvailable } from 'utils/markets';
import MarketCardCanceled from './MarketCardCanceled';
import MarketCardMatured from './MarketCardMatured';
import MarketCardOpened from './MarketCardOpened';
import MarketCardResolved from './MarketCardResolved';

type MarketCardProps = {
    market: SportMarketInfo;
    accountPositions?: AccountPosition[];
};

const MarketCard: React.FC<MarketCardProps> = ({ market, accountPositions }) => {
    const claimAvailable = isClaimAvailable(accountPositions);

    return market.isResolved ? (
        <Container isResolved={market.isResolved} isClaimAvailable={claimAvailable}>
            <MarketCardResolved market={market} accountPositions={accountPositions} />
        </Container>
    ) : market.isCanceled ? (
        <Container isCanceled={market.isCanceled}>
            <MarketCardCanceled market={market} />
        </Container>
    ) : market.maturityDate < new Date() ? (
        <Container>
            <MarketCardMatured market={market} />
        </Container>
    ) : (
        <Container>
            <MarketCardOpened accountPositions={accountPositions} market={market} />
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)<{
    isClaimAvailable?: boolean;
    isCanceled?: boolean;
    isResolved?: boolean;
}>`
    box-sizing: border-box;
    border-radius: 14px;
    padding: 16px 19px;
    margin: 20px 10px;
    max-height: 275px;
    background: ${(props) =>
        (props.isResolved && !props.isClaimAvailable) || props.isCanceled
            ? 'rgba(48, 54, 86, 0.5)'
            : props.theme.background.secondary};
    border: ${(props) =>
        props.isClaimAvailable
            ? '2px solid ' + props.theme.borderColor.quaternary
            : props.isCanceled
            ? '2px solid ' + props.theme.oddsColor.secondary
            : ''};
    &:hover {
        background-origin: border-box;
    }
    cursor: pointer;
`;

export default MarketCard;
