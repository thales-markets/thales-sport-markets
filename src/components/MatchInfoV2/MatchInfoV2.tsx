import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getLiveBetSlippage, getTicketPayment, removeFromTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { TicketMarket } from 'types/markets';
import { formatMarketOdds, isWithinSlippage } from 'utils/markets';
import { getMatchLabel, getPositionTextV2, getTitleText } from 'utils/marketsV2';
import { getNetworkId } from '../../redux/modules/wallet';
import { getCollateral } from '../../utils/collaterals';
import { getAddedPayoutMultiplier } from '../../utils/tickets';
import MatchLogosV2 from '../MatchLogosV2';

type MatchInfoProps = {
    market: TicketMarket;
    readOnly?: boolean;
    customStyle?: { fontSize?: string; lineHeight?: string };
    showOddUpdates?: boolean;
};

const MatchInfo: React.FC<MatchInfoProps> = ({ market, readOnly, customStyle, showOddUpdates }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const networkId = useSelector(getNetworkId);
    const selectedOddsType = useSelector(getOddsType);
    const matchLabel = getMatchLabel(market);
    const ticketPayment = useSelector(getTicketPayment);
    const liveBetSlippage = useSelector(getLiveBetSlippage);
    const selectedCollateral = useMemo(() => getCollateral(networkId, ticketPayment.selectedCollateralIndex), [
        networkId,
        ticketPayment.selectedCollateralIndex,
    ]);
    const positionText = getPositionTextV2(market, market.position, true);

    // used only for live ticket
    const previousMarket = useRef<TicketMarket>(market);
    const firstClickMarket = useRef<TicketMarket>(market);

    useEffect(() => {
        if (market.live && showOddUpdates) {
            if (
                previousMarket.current.gameId === market.gameId &&
                previousMarket.current.position === market.position
            ) {
                if (isWithinSlippage(firstClickMarket.current.odd, market.odd, liveBetSlippage)) {
                    if (market.odd < previousMarket.current.odd) {
                        document.getElementById('odd-change-up')?.classList.add('rise');
                        setTimeout(() => {
                            document.getElementById('odd-change-up')?.classList.remove('rise');
                        }, 3000);
                    }
                    if (market.odd > previousMarket.current.odd) {
                        document.getElementById('odd-change-down')?.classList.add('descend');
                        setTimeout(() => {
                            document.getElementById('odd-change-down')?.classList.remove('descend');
                        }, 3000);
                    }
                }
            } else {
                firstClickMarket.current = market;
            }
            previousMarket.current = market;
        }
    }, [market, market.odd, liveBetSlippage, showOddUpdates]);

    return (
        <>
            <LeftContainer>
                {market.live && <LiveTag>{t(`markets.market-card.live`)}</LiveTag>}
                <MatchLogosV2 market={market} width={'55px'} height={'30px'} />
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
                    <Odd>
                        <OddChangeUp id="odd-change-up" />
                        <OddChangeDown id="odd-change-down" />
                        {formatMarketOdds(selectedOddsType, market.odd * getAddedPayoutMultiplier(selectedCollateral))}
                    </Odd>
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

const OddChangeUp = styled.span`
    position: absolute;
    bottom: 0;
    left: -15px;
    visibility: hidden;
    margin-right: 5px;
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid ${(props) => props.theme.borderColor.tertiary};
    &.rise {
        visibility: visible;
        animation-name: rise;
        animation-duration: 0.8s;
        animation-iteration-count: 3;
    }
    @keyframes rise {
        0% {
            transform: scale(1) translateY(-1px);
            opacity: 1;
        }
        100% {
            transform: scale(0.9) translateY(-11px);
            opacity: 0.5;
        }
    }
`;

const OddChangeDown = styled.span`
    position: absolute;
    top: 0;
    left: -15px;
    visibility: hidden;
    margin-right: 5px;
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${(props) => props.theme.borderColor.septenary};
    &.descend {
        visibility: visible;
        animation-name: descend;
        animation-duration: 0.8s;
        animation-iteration-count: 3;
    }
    @keyframes descend {
        0% {
            transform: scale(1) translateY(1);
            opacity: 1;
        }
        100% {
            transform: scale(0.9) translateY(11px);
            opacity: 0.5;
        }
    }
`;

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
    position: relative;
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
