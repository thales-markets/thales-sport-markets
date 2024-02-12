import PositionSymbol from 'components/PositionSymbol';
import { Position } from 'enums/markets';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import styled, { useTheme } from 'styled-components';
import { TicketMarket } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import {
    formatMarketOdds,
    getLineInfoV2,
    getMarketNameV2,
    getOddTooltipTextV2,
    getPositionOddsV2,
    getSymbolTextV2,
} from 'utils/markets';
import MatchLogosV2 from '../MatchLogosV2';
import { XButton } from '../styled-components';

type MatchInfoProps = {
    market: TicketMarket;
    readOnly?: boolean;
    isHighlighted?: boolean;
    customStyle?: { fontSize?: string; lineHeight?: string };
    updatedQuote?: number;
};

const MatchInfo: React.FC<MatchInfoProps> = ({ market, readOnly, isHighlighted, customStyle, updatedQuote }) => {
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const selectedOddsType = useSelector(getOddsType);
    const symbolText = getSymbolTextV2(market.position, market);
    const lineInfo = getLineInfoV2(market, market.position);
    const marketNameHome = getMarketNameV2(market, Position.HOME);
    const marketNameAway = getMarketNameV2(market, Position.AWAY);

    return (
        <>
            <MatchLogosV2 market={market} width={'120px'} isHighlighted={isHighlighted} />
            <MatchLabel>
                <ClubName fontSize={customStyle?.fontSize} lineHeight={customStyle?.lineHeight}>
                    {marketNameHome}
                </ClubName>
                {!market.isOneSideMarket && !market.isPlayerPropsMarket && (
                    <ClubName fontSize={customStyle?.fontSize} lineHeight={customStyle?.lineHeight}>
                        {marketNameAway}
                    </ClubName>
                )}
            </MatchLabel>
            <PositionSymbol
                symbolAdditionalText={{
                    text: formatMarketOdds(selectedOddsType, updatedQuote || getPositionOddsV2(market)),
                    textStyle: {
                        width: '34px',
                        marginRight: '3px',
                        textAlign: 'right',
                    },
                }}
                symbolText={symbolText}
                symbolUpperText={
                    lineInfo && !market.isPlayerPropsMarket
                        ? {
                              text: lineInfo,
                              textStyle: {
                                  backgroundColor: customStyle
                                      ? theme.oddsGradiendBackground.primary
                                      : theme.oddsGradiendBackground.secondary,
                                  top: '-9px',
                              },
                          }
                        : undefined
                }
                tooltip={!readOnly && <>{getOddTooltipTextV2(market.position, market)}</>}
                additionalStyle={market.isOneSideMarket && market.isPlayerPropsMarket ? { fontSize: 10 } : {}}
            />
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
                        dispatch(removeFromTicket(market.gameId));
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
