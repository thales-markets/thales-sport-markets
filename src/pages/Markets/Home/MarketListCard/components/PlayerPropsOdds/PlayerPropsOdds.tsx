import Tooltip from 'components/Tooltip';
import { BetTypeNameMap, BetTypeTitleMap } from 'constants/tags';
import { BetType, Position } from 'enums/markets';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SportMarketChildMarkets, SportMarketInfo } from 'types/markets';
import { isOneSidePlayerProps, isSpecialYesNoProp } from 'utils/markets';
import Odd from '../Odd';
import { Container, OddsContainer } from './styled-components';

type PlayerPropsOdds = {
    markets: SportMarketInfo[];
};

const PlayerPropsOdds: React.FC<PlayerPropsOdds> = ({ markets }) => {
    const { t } = useTranslation();
    const marketsUI: SportMarketInfo[][] = useMemo(() => {
        const lastValidChildMarkets: SportMarketChildMarkets = {
            spreadMarkets: [],
            totalMarkets: [],
            doubleChanceMarkets: [],
            strikeOutsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_STRIKEOUTS),
            homeRunsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_HOMERUNS),
            passingYardsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_PASSING_YARDS),
            rushingYardsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_RUSHING_YARDS),
            receivingYardsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_RECEIVING_YARDS),
            oneSiderTouchdownsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_TOUCHDOWNS),
            passingTouchdownsMarkets: markets.filter(
                (market) => market.betType == BetType.PLAYER_PROPS_PASSING_TOUCHDOWNS
            ),
            fieldGoalsMadeMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_FIELD_GOALS_MADE),
            pitcherHitsAllowedMarkets: markets.filter(
                (market) => market.betType == BetType.PLAYER_PROPS_PITCHER_HITS_ALLOWED
            ),
            hitsRecordedMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_HITS_RECORDED),
            pointsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_POINTS),
            shotsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_SHOTS),
            oneSiderGoalsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_GOALS),
            reboundsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_REBOUNDS),
            assistsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_ASSISTS),
            doubleDoubleMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_DOUBLE_DOUBLE),
            tripleDoubleMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_TRIPLE_DOUBLE),
            receptionsMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_RECEPTIONS),
            firstTouchdownMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_FIRST_TOUCHDOWN),
            lastTouchdownMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_LAST_TOUCHDOWN),
            threePointsMadeMarkets: markets.filter((market) => market.betType == BetType.PLAYER_PROPS_3PTS_MADE),
        };

        const result = [];
        if (lastValidChildMarkets.strikeOutsMarkets.length > 0) {
            result.push(lastValidChildMarkets.strikeOutsMarkets);
        }
        if (lastValidChildMarkets.homeRunsMarkets.length > 0) {
            result.push(lastValidChildMarkets.homeRunsMarkets);
        }
        if (lastValidChildMarkets.passingTouchdownsMarkets.length > 0) {
            result.push(lastValidChildMarkets.passingTouchdownsMarkets);
        }
        if (lastValidChildMarkets.rushingYardsMarkets.length > 0) {
            result.push(lastValidChildMarkets.rushingYardsMarkets);
        }
        if (lastValidChildMarkets.passingYardsMarkets.length > 0) {
            result.push(lastValidChildMarkets.passingYardsMarkets);
        }
        if (lastValidChildMarkets.receivingYardsMarkets.length > 0) {
            result.push(lastValidChildMarkets.receivingYardsMarkets);
        }

        if (lastValidChildMarkets.fieldGoalsMadeMarkets.length > 0) {
            result.push(lastValidChildMarkets.fieldGoalsMadeMarkets);
        }

        if (lastValidChildMarkets.pitcherHitsAllowedMarkets.length > 0) {
            result.push(lastValidChildMarkets.pitcherHitsAllowedMarkets);
        }

        if (lastValidChildMarkets.hitsRecordedMarkets.length > 0) {
            result.push(lastValidChildMarkets.hitsRecordedMarkets);
        }

        if (lastValidChildMarkets.pointsMarkets.length > 0) {
            result.push(lastValidChildMarkets.pointsMarkets);
        }

        if (lastValidChildMarkets.reboundsMarkets.length > 0) {
            result.push(lastValidChildMarkets.reboundsMarkets);
        }

        if (lastValidChildMarkets.assistsMarkets.length > 0) {
            result.push(lastValidChildMarkets.assistsMarkets);
        }

        if (lastValidChildMarkets.threePointsMadeMarkets.length > 0) {
            result.push(lastValidChildMarkets.threePointsMadeMarkets);
        }

        if (lastValidChildMarkets.doubleDoubleMarkets.length > 0) {
            result.push(lastValidChildMarkets.doubleDoubleMarkets);
        }

        if (lastValidChildMarkets.tripleDoubleMarkets.length > 0) {
            result.push(lastValidChildMarkets.tripleDoubleMarkets);
        }

        if (lastValidChildMarkets.shotsMarkets.length > 0) {
            result.push(lastValidChildMarkets.shotsMarkets);
        }

        if (lastValidChildMarkets.oneSiderTouchdownsMarkets.length > 0) {
            result.push(lastValidChildMarkets.oneSiderTouchdownsMarkets);
        }

        if (lastValidChildMarkets.oneSiderGoalsMarkets.length > 0) {
            result.push(lastValidChildMarkets.oneSiderGoalsMarkets);
        }

        if (lastValidChildMarkets.receptionsMarkets.length > 0) {
            result.push(lastValidChildMarkets.receptionsMarkets);
        }

        if (lastValidChildMarkets.firstTouchdownMarkets.length > 0) {
            result.push(lastValidChildMarkets.firstTouchdownMarkets);
        }

        if (lastValidChildMarkets.lastTouchdownMarkets.length > 0) {
            result.push(lastValidChildMarkets.lastTouchdownMarkets);
        }

        return result;
    }, [markets]);

    return (
        <Container>
            {marketsUI.map((ppMarkets, index) => {
                return (
                    <SectionContainer key={index} dark={index % 2 === 0}>
                        <SectionTitle>
                            {BetTypeTitleMap[ppMarkets[0].betType as BetType]
                                ? BetTypeTitleMap[ppMarkets[0].betType as BetType]
                                : BetTypeNameMap[ppMarkets[0].betType as BetType]}
                            {(ppMarkets[0].betType as BetType) == BetType.PLAYER_PROPS_TOUCHDOWNS && (
                                <Tooltip
                                    overlay={
                                        <>
                                            {t(
                                                `markets.market-card.odd-tooltip.player-props.info.${
                                                    BetTypeNameMap[ppMarkets[0].betType as BetType]
                                                }`
                                            )}
                                        </>
                                    }
                                    iconFontSize={13}
                                    marginLeft={3}
                                />
                            )}
                        </SectionTitle>
                        <OddsWrapper>
                            {ppMarkets.map((ppMarket, ind) => {
                                return (
                                    <MarketContainer key={ind}>
                                        <Player>{`${ppMarket.playerName} ${
                                            isOneSidePlayerProps(ppMarket.betType) ||
                                            isSpecialYesNoProp(ppMarket.betType)
                                                ? ''
                                                : ppMarket.playerPropsLine
                                        }`}</Player>
                                        <OddsContainer>
                                            <Odd
                                                market={ppMarket}
                                                position={Position.HOME}
                                                odd={ppMarket.homeOdds}
                                                bonus={ppMarket.homeBonus}
                                            />
                                            {!isOneSidePlayerProps(ppMarket.betType) ? (
                                                <Odd
                                                    market={ppMarket}
                                                    position={Position.AWAY}
                                                    odd={ppMarket.awayOdds}
                                                    bonus={ppMarket.awayBonus}
                                                />
                                            ) : (
                                                <></>
                                            )}
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
