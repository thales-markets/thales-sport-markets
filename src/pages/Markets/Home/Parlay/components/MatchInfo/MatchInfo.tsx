import PositionSymbol from 'components/PositionSymbol';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromParlay } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { ParlaysMarket } from 'types/markets';
import {
    formatMarketOdds,
    getBonus,
    getFormattedBonus,
    getOddTooltipText,
    getPositionOdds,
    getSpreadTotalText,
    getSymbolText,
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
    const selectedOddsType = useSelector(getOddsType);

    const symbolText = getSymbolText(market.position, market);
    const spreadTotalText = getSpreadTotalText(market, market.position);

    const bonus = getBonus(market);

    return (
        <>
            <MatchLogos market={market} width={'120px'} padding={'0 0 0 4px'} isHighlighted={isHighlighted} />
            <MatchLabel>
                <ClubName fontSize={customStyle?.fontSize} lineHeight={customStyle?.lineHeight}>
                    {market.homeTeam}
                </ClubName>
                <ClubName fontSize={customStyle?.fontSize} lineHeight={customStyle?.lineHeight}>
                    {market.awayTeam}
                </ClubName>
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
                    spreadTotalText
                        ? {
                              text: spreadTotalText,
                              textStyle: {
                                  backgroundColor: customStyle ? '#23273e' : '#2f3454',
                                  top: '-9px',
                              },
                          }
                        : undefined
                }
                tooltip={<>{getOddTooltipText(market.position, market)}</>}
            />
            {!readOnly && <Bonus>{bonus > 0 ? getFormattedBonus(bonus) : ''}</Bonus>}
            {readOnly ? (
                market?.isResolved ? (
                    market?.winning ? (
                        <Correct className={`icon icon--correct`} />
                    ) : (
                        <Wrong className={`icon icon--wrong`} />
                    )
                ) : market?.isCanceled ? (
                    <Canceled className={`icon icon--open`} />
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
    color: #ffffff;
`;

const Bonus = styled.div`
    min-width: 28px;
    font-size: 12px;
    font-weight: 600;
    color: #5fc694;
    margin-right: 4px;
`;

const Icon = styled.i`
    font-size: 12px;
`;
const Correct = styled(Icon)`
    color: #339d6a;
`;
const Wrong = styled(Icon)`
    color: #ca4c53;
`;
const Canceled = styled(Icon)`
    color: #ffffff;
`;
const Empty = styled(Icon)`
    visibility: hidden;
`;

export default MatchInfo;
