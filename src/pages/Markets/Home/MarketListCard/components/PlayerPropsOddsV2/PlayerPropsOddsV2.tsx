import Tooltip from 'components/Tooltip';
import { BetTypeTitleMap } from 'constants/tags';
import { BetType } from 'enums/markets';
import { groupBy } from 'lodash';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SportMarketInfoV2 } from 'types/markets';
import OddV2 from '../OddV2';
import { Container, OddsContainer } from './styled-components';

type PlayerPropsOdds = {
    markets: SportMarketInfoV2[];
};

const PlayerPropsOdds: React.FC<PlayerPropsOdds> = ({ markets }) => {
    const { t } = useTranslation();
    const groupedPlayerPropsMarkets = useMemo(() => groupBy(markets, (market) => market.typeId), [markets]);

    return (
        <Container>
            {Object.keys(groupedPlayerPropsMarkets).map((key, index) => {
                const typeId = Number(key);
                const ppMarkets = groupedPlayerPropsMarkets[typeId];
                return (
                    <SectionContainer key={index} dark={index % 2 === 0}>
                        <SectionTitle>
                            {BetTypeTitleMap[typeId as BetType]}
                            {typeId == BetType.PLAYER_PROPS_TOUCHDOWNS && (
                                <Tooltip
                                    overlay={<>{t(`markets.market-card.type-tooltip.${typeId}`)}</>}
                                    iconFontSize={13}
                                    marginLeft={3}
                                />
                            )}
                        </SectionTitle>
                        <OddsWrapper>
                            {ppMarkets.map((ppMarket, index) => {
                                return (
                                    <MarketContainer key={index}>
                                        <Player>{`${ppMarket.playerProps.playerName} ${
                                            ppMarket.isOneSidePlayerPropsMarket || ppMarket.isYesNoPlayerPropsMarket
                                                ? ''
                                                : ppMarket.line
                                        }`}</Player>
                                        <OddsContainer>
                                            {ppMarket.odds.map((_, index) => (
                                                <OddV2 key={index} market={ppMarket} position={index} />
                                            ))}
                                        </OddsContainer>
                                    </MarketContainer>
                                );
                            })}
                        </OddsWrapper>
                    </SectionContainer>
                );
            })}
        </Container>
    );
};

const SectionContainer = styled.div<{ dark: boolean }>`
    background: ${(props) =>
        props.dark ? props.theme.oddsContainerBackground.primary : props.theme.oddsContainerBackground.secondary};
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 10px;
    flex-direction: column;
    gap: 10px;
`;
const OddsWrapper = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 10px;
`;

const SectionTitle = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 12px;
    font-style: normal;
    font-weight: 400;
    line-height: normal;
    text-transform: uppercase;
    line-height: 12px;
    width: 100%;
`;

const Player = styled.span`
    color: ${(props) => props.theme.textColor.quaternary};
    font-size: 10px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    line-height: 14px;
    text-transform: uppercase;
`;

const MarketContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    gap: 5px;
    flex-basis: 23%;
    :not(:last-of-type) {
        border-right: 3px solid ${(props) => props.theme.borderColor.primary};
        padding-right: 10px;
    }
    :last-of-type {
        padding-right: 13px;
    }
`;

export default PlayerPropsOdds;
