import React from 'react';
import styled from 'styled-components';
import { FlexDivColumnCentered } from 'styles/common';
import { AccountPosition, SportMarketInfo } from 'types/markets';
import { isClaimAvailable } from 'utils/markets';
import MarketCardMatured from './MarketCardMatured';
import MarketCardOpened from './MarketCardOpened';
import MarketCardResolved from './MarketCardResolved';

type MarketCardProps = {
    market: SportMarketInfo;
    accountPosition?: AccountPosition;
};

const MarketCard: React.FC<MarketCardProps> = ({ market, accountPosition }) => {
    const claimAvailable = isClaimAvailable(market, accountPosition);

    return market.isResolved ? (
        <Container isClaimAvailable={claimAvailable}>
            <MarketCardResolved isClaimAvailable={claimAvailable} market={market} />
        </Container>
    ) : market.maturityDate < new Date() ? (
        <Container>
            <MarketCardMatured market={market} />
        </Container>
    ) : (
        <Container>
            <MarketCardOpened market={market} />
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)<{ isClaimAvailable?: boolean }>`
    box-sizing: border-box;
    border-radius: 14px;
    padding: 16px 19px;
    margin: 20px 10px;
    max-height: 275px;
    background: ${(props) => props.theme.background.secondary};
    border: ${(props) => (props.isClaimAvailable ? '2px solid ' + props.theme.borderColor.quaternary : '')};
    &:hover {
        border-color: transparent;
        background-origin: border-box;
    }
    cursor: pointer;
`;

export default MarketCard;
