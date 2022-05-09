import MarketStatus from 'pages/Markets/components/MarketStatus';
import MarketTitle from 'pages/Markets/components/MarketTitle';
import Tags from 'pages/Markets/components/Tags';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { AccountPosition, MarketInfo } from 'types/markets';
import { MarketStatus as MarketStatusEnum } from 'constants/markets';
import { formatCurrencyWithKey } from 'utils/formatters/number';
import { DEFAULT_CURRENCY_DECIMALS, PAYMENT_CURRENCY } from 'constants/currency';
import { Info, InfoContent, InfoLabel } from 'components/common';
import { isClaimAvailable } from 'utils/markets';

type MarketCardProps = {
    market: MarketInfo;
    accountPosition?: AccountPosition;
};

const MarketCard: React.FC<MarketCardProps> = ({ market, accountPosition }) => {
    const { t } = useTranslation();

    const claimAvailable = isClaimAvailable(market, accountPosition);

    return (
        <Container isClaimAvailable={claimAvailable}>
            <MarketTitle>{market.question}</MarketTitle>
            <Positions>
                {market.positions.map((position: string, index: number) => (
                    <Position
                        key={`${position}${index}`}
                        className={
                            market.status === MarketStatusEnum.Open || market.winningPosition === index + 1
                                ? ''
                                : 'disabled'
                        }
                    >
                        {!!accountPosition && accountPosition.position === index + 1 && <Checkmark />}
                        <PositionLabel>{position}</PositionLabel>
                    </Position>
                ))}
            </Positions>
            <Info fontSize={18} marginBottom={15}>
                <InfoLabel>{t('market.ticket-price-label')}:</InfoLabel>
                <InfoContent>
                    {formatCurrencyWithKey(PAYMENT_CURRENCY, market.ticketPrice, DEFAULT_CURRENCY_DECIMALS, true)}
                </InfoContent>
            </Info>
            <MarketStatus market={market} fontWeight={700} isClaimAvailable={claimAvailable} />
            <CardFooter>
                <Tags tags={market.tags} />
            </CardFooter>
            <PoolInfoFooter>
                <Info>
                    <InfoLabel>{t('market.total-pool-size-label')}:</InfoLabel>
                    <InfoContent>
                        {formatCurrencyWithKey(PAYMENT_CURRENCY, market.poolSize, DEFAULT_CURRENCY_DECIMALS, true)}
                    </InfoContent>
                </Info>
                <Info>
                    <InfoLabel>{t('market.number-of-participants-label')}:</InfoLabel>
                    <InfoContent>{market.numberOfParticipants}</InfoContent>
                </Info>
            </PoolInfoFooter>
        </Container>
    );
};

const Container = styled(FlexDivColumnCentered)<{ isClaimAvailable: boolean }>`
    border: ${(props) => (props.isClaimAvailable ? 2 : 1)}px solid
        ${(props) => (props.isClaimAvailable ? props.theme.borderColor.secondary : props.theme.borderColor.primary)};
    box-sizing: border-box;
    border-radius: 25px;
    padding: 20px;
    margin: 8px 4px 8px 4px;
    &:hover {
        background: ${(props) => props.theme.background.secondary};
        border-color: transparent;
        background-origin: border-box;
    }
`;

const Positions = styled(FlexDivColumnCentered)`
    margin-bottom: 20px;
    align-items: center;
    align-self: center;
    padding: 0 20px;
`;

const Position = styled.label`
    display: block;
    position: relative;
    margin-bottom: 20px;
    text-align: center;
    cursor: pointer;
    &.disabled {
        opacity: 0.4;
    }
`;

const PositionLabel = styled.span`
    font-style: normal;
    font-weight: bold;
    font-size: 20px;
    line-height: 100%;
    color: ${(props) => props.theme.textColor.primary};
`;

const Checkmark = styled.span`
    :after {
        content: '';
        position: absolute;
        left: -17px;
        top: -1px;
        width: 5px;
        height: 14px;
        border: solid ${(props) => props.theme.borderColor.primary};
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    }
`;

const CardFooter = styled(FlexDivRow)`
    margin-top: 20px;
    align-items: end;
`;

const PoolInfoFooter = styled(FlexDivColumnCentered)`
    font-size: 15px;
    margin-top: 10px;
`;

export default MarketCard;
