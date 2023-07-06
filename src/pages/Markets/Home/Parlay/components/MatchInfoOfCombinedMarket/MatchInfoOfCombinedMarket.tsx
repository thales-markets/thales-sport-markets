import PositionSymbol from 'components/PositionSymbol';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeCombinedMarketFromParlay } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { CombinedParlayMarket } from 'types/markets';
import { formatMarketOdds, getCombinedOddTooltipText, getFormattedBonus, getSpreadTotalText } from 'utils/markets';
import { getCombinedPositionName } from 'utils/combinedMarkets';
import MatchLogos from '../MatchLogos';
import { XButton } from '../styled-components';

type MatchInfoCominedMarketProps = {
    combinedMarket: CombinedParlayMarket;
    readOnly?: boolean;
    isHighlighted?: boolean;
    customStyle?: { fontSize?: string; lineHeight?: string };
};

const MatchInfoOfCombinedMarket: React.FC<MatchInfoCominedMarketProps> = ({
    combinedMarket,
    readOnly,
    isHighlighted,
    customStyle,
}) => {
    const dispatch = useDispatch();
    const selectedOddsType = useSelector(getOddsType);
    const market = combinedMarket.markets[0];

    const totalMarket = combinedMarket.markets[1];

    const spreadTotalText = getSpreadTotalText(totalMarket, totalMarket.position);

    const parentAddressOfCombinedMarket = combinedMarket?.markets[0].parentMarket
        ? combinedMarket?.markets[0].parentMarket
        : combinedMarket?.markets[0].address || '';

    const symbolText = getCombinedPositionName(combinedMarket?.markets, combinedMarket.positions);
    const tooltipText = getCombinedOddTooltipText(combinedMarket.markets, combinedMarket.positions);
    const bonus = 0;
    const odd = combinedMarket.totalOdd;

    const isMarketCanceled = combinedMarket.markets[0].isCanceled && combinedMarket.markets[1].isCanceled;
    const isMarketWinning = combinedMarket.markets[0].winning && combinedMarket.markets[1].winning;
    const isMarketResolved = combinedMarket.markets[0].isResolved && combinedMarket.markets[1].isResolved;

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
                    text: formatMarketOdds(selectedOddsType, odd),
                    textStyle: {
                        width: '34px',
                        marginRight: '3px',
                        textAlign: 'right',
                    },
                }}
                symbolText={symbolText ? symbolText : ''}
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
                tooltip={<>{tooltipText}</>}
            />
            {!readOnly && <Bonus>{bonus > 0 ? getFormattedBonus(bonus) : ''}</Bonus>}
            {readOnly ? (
                isMarketCanceled ? (
                    <Canceled className={`icon icon--open`} />
                ) : isMarketResolved ? (
                    isMarketWinning ? (
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
                        dispatch(removeCombinedMarketFromParlay(parentAddressOfCombinedMarket));
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
    color: ${(props) => props.theme.textColor.primary};
`;
const Empty = styled(Icon)`
    visibility: hidden;
`;

export default MatchInfoOfCombinedMarket;
