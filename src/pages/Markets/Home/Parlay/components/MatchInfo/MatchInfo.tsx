import PositionSymbol from 'components/PositionSymbol';
import { Position } from 'enums/markets';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromParlay } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { ParlaysMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import {
    formatMarketOdds,
    getBonus,
    getFormattedBonus,
    getMarketName,
    getOddTooltipText,
    getPositionOdds,
    getSpreadTotalText,
    getSymbolText,
    isOneSidePlayerProps,
    isSpecialYesNoProp,
} from 'utils/markets';
import MatchLogos from '../MatchLogos';
import { XButton } from '../styled-components';

type MatchInfoProps = {
    market: ParlaysMarket;
    readOnly?: boolean;
    isHighlighted?: boolean;
    customStyle?: { fontSize?: string; lineHeight?: string };
};

const MatchInfo: React.FC<MatchInfoProps> = ({ market, readOnly, isHighlighted, customStyle }) => {
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const selectedOddsType = useSelector(getOddsType);
    const symbolText = getSymbolText(market.position, market);
    const spreadTotalText = getSpreadTotalText(market, market.position);
    const bonus = getBonus(market);
    const marketNameHome = getMarketName(market, Position.HOME);
    const marketNameAway = getMarketName(market, Position.AWAY);

    return (
        <>
            <MatchLogos market={market} width={'120px'} padding={'0 0 0 4px'} isHighlighted={isHighlighted} />
            <MatchLabel>
                <ClubName fontSize={customStyle?.fontSize} lineHeight={customStyle?.lineHeight}>
                    {marketNameHome}
                </ClubName>
                {!market.isOneSideMarket && market.playerName === null && (
                    <ClubName fontSize={customStyle?.fontSize} lineHeight={customStyle?.lineHeight}>
                        {marketNameAway}
                    </ClubName>
                )}
            </MatchLabel>
            <PositionSymbol
                symbolAdditionalText={{
                    text: formatMarketOdds(selectedOddsType, getPositionOdds(market)),
                    textStyle: {
                        width: '34px',
                        marginRight: '3px',
                        textAlign: 'right',
                    },
                }}
                symbolText={symbolText}
                symbolUpperText={
                    spreadTotalText && !isOneSidePlayerProps(market.betType) && !isSpecialYesNoProp(market.betType)
                        ? {
                              text: spreadTotalText,
                              textStyle: {
                                  backgroundColor: customStyle
                                      ? theme.oddsGradiendBackground.primary
                                      : theme.oddsGradiendBackground.secondary,
                                  top: '-9px',
                              },
                          }
                        : undefined
                }
                tooltip={!readOnly && <>{getOddTooltipText(market.position, market)}</>}
                additionalStyle={
                    market.isOneSideMarket || isOneSidePlayerProps(market.betType) || isSpecialYesNoProp(market.betType)
                        ? { fontSize: 10 }
                        : {}
                }
            />
            {!readOnly && <Bonus>{bonus > 0 ? getFormattedBonus(bonus) : ''}</Bonus>}
            {readOnly ? (
                market?.isCanceled ? (
                    <Canceled className={`icon icon--open`} />
                ) : market?.isResolved ? (
                    market?.winning ? (
                        <Correct className={`icon icon--correct`} />
                    ) : (
                        <Wrong className={`icon icon--wrong`} />
                    )
                ) : (
                    <Empty className={`icon icon--open`} />
                )
            ) : (
                <XButton
                    onClick={() => {
                        dispatch(removeFromParlay(market.address));
                    }}
                    className={`icon icon--cross-button`}
                />
            )}
        </>
    );
};

const MatchLabel = styled.div`
    display: block;
    width: 100%;
    margin-right: 5px;
`;

const ClubName = styled.span<{ fontSize?: string; lineHeight?: string }>`
    display: block;
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 300;
    font-size: ${(props) => (props.fontSize ? props.fontSize : '10px')};
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : '11px')};
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
    white-space: pre-line;
`;

const Bonus = styled.div`
    min-width: 28px;
    font-size: 12px;
    font-weight: 600;
    color: ${(props) => props.theme.status.win};
    margin-right: 4px;
`;

const Icon = styled.i`
    font-size: 12px;
`;
const Correct = styled(Icon)`
    color: ${(props) => props.theme.status.win};
`;
const Wrong = styled(Icon)`
    color: ${(props) => props.theme.status.loss};
`;
const Canceled = styled(Icon)`
    color: ${(props) => props.theme.textColor.primary};
`;
const Empty = styled(Icon)`
    visibility: hidden;
`;

export default MatchInfo;
