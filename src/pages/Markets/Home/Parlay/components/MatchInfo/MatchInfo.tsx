import PositionSymbol from 'components/PositionSymbol';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromParlay } from 'redux/modules/parlay';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { Colors } from 'styles/common';
import { ParlaysMarket } from 'types/markets';
import { convertPositionToSymbolType, formatMarketOdds, getIsApexTopGame, getPositionOdds } from 'utils/markets';
import MatchLogos from '../MatchLogos';
import { XButton } from '../styled-components';

type MatchInfoProps = {
    market: ParlaysMarket;
    readOnly?: boolean;
    isHighlighted?: boolean;
    customStyle?: { fontSize?: string; lineHeight?: string; positionColor?: string };
};

const MatchInfo: React.FC<MatchInfoProps> = ({ market, readOnly, isHighlighted, customStyle }) => {
    const dispatch = useDispatch();
    const selectedOddsType = useSelector(getOddsType);

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
                type={convertPositionToSymbolType(market.position, getIsApexTopGame(market.isApex, market.betType))}
                symbolColor={Colors.WHITE}
                additionalText={{
                    firstText: formatMarketOdds(selectedOddsType, getPositionOdds(market)),
                    firstTextStyle: {
                        fontSize: customStyle?.fontSize ? customStyle?.fontSize : '11px',
                        color: Colors.WHITE,
                        marginLeft: '5px',
                    },
                }}
            />
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
                    <></>
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

const Correct = styled.i`
    font-size: 12px;
    color: #339d6a;
`;
const Wrong = styled.i`
    font-size: 12px;
    color: #ca4c53;
`;
const Canceled = styled.i`
    font-size: 12px;
    color: #ffffff;
`;

export default MatchInfo;
