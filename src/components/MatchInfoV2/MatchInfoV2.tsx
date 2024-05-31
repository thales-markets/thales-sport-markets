import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { TicketMarket } from 'types/markets';
import { formatMarketOdds } from 'utils/markets';
import { getMatchLabel, getPositionTextV2, getTitleText } from 'utils/marketsV2';
import MatchLogosV2 from '../MatchLogosV2';

type MatchInfoProps = {
    market: TicketMarket;
    readOnly?: boolean;
    customStyle?: { fontSize?: string; lineHeight?: string };
};

const MatchInfo: React.FC<MatchInfoProps> = ({ market, readOnly, customStyle }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedOddsType = useSelector(getOddsType);
    const matchLabel = getMatchLabel(market);

    const positionText = getPositionTextV2(market, market.position, true);

    return (
        <>
            <LeftContainer>
                {market.live && <LiveTag>{t(`markets.market-card.live`)}</LiveTag>}
                <MatchLogosV2 market={market} width={'55px'} />
            </LeftContainer>
            <MarketPositionContainer>
                <MatchLabel fontSize={customStyle?.fontSize} lineHeight={customStyle?.lineHeight}>
                    {matchLabel}
                    <CloseIcon
                        className="icon icon--close"
                        onClick={() => {
                            dispatch(removeFromTicket(market.gameId));
                        }}
                    />
                </MatchLabel>
                <MarketTypeInfo>{getTitleText(market)}</MarketTypeInfo>
                <PositionInfo>
                    <PositionText>{positionText}</PositionText>
                    <Odd>{formatMarketOdds(selectedOddsType, market.odd)}</Odd>
                </PositionInfo>
            </MarketPositionContainer>
            {readOnly && (
                <>
                    {market.isCancelled ? (
                        <Canceled className={`icon icon--open`} />
                    ) : market.isResolved ? (
                        market.isWinning ? (
                            <Correct className={`icon icon--correct`} />
                        ) : (
                            <Wrong className={`icon icon--wrong`} />
                        )
                    ) : (
                        <Empty className={`icon icon--open`} />
                    )}
                </>
            )}
        </>
    );
};

const LeftContainer = styled(FlexDivColumn)`
    flex: initial;
    height: 100%;
`;

const LiveTag = styled.span`
    background: ${(props) => props.theme.status.live};
    border-radius: 3px;
    font-weight: 600;
    font-size: 10px;
    height: 12px;
    line-height: 12px;
    padding: 0 12px;
    width: fit-content;
    margin-bottom: 5px;
`;

const MarketPositionContainer = styled(FlexDivColumn)`
    display: block;
    width: 100%;
    margin-right: 5px;
`;

const MatchLabel = styled(FlexDivRow)<{ fontSize?: string; lineHeight?: string }>`
    font-weight: 600;
    font-size: ${(props) => (props.fontSize ? props.fontSize : '13px')};
    line-height: ${(props) => (props.lineHeight ? props.lineHeight : '13px')};
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: 5px;
    text-align: start;
`;

const MarketTypeInfo = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 13px;
    line-height: 13px;
    color: ${(props) => props.theme.textColor.quinary};
    margin-bottom: 5px;
`;

const PositionInfo = styled(FlexDivRow)`
    font-weight: 600;
    font-size: 13px;
    line-height: 13px;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const PositionText = styled.span`
    text-align: start;
`;

const Odd = styled.span`
    margin-left: 5px;
`;

const CloseIcon = styled.i`
    font-size: 10px;
    color: ${(props) => props.theme.textColor.secondary};
    cursor: pointer;
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
