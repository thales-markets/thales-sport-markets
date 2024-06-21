import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getLiveBetSlippage, getTicketPayment, removeFromTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import styled from 'styled-components';
import { FlexDivColumn, FlexDivRow } from 'styles/common';
import { TicketMarket } from 'types/markets';
import { formatMarketOdds, isWithinSlippage } from 'utils/markets';
import {
    getMatchLabel,
    getPositionTextV2,
    getTitleText,
    isSameMarket,
    ticketMarketAsTicketPosition,
} from 'utils/marketsV2';
import { getNetworkId } from '../../redux/modules/wallet';
import { getCollateral } from '../../utils/collaterals';
import { getAddedPayoutMultiplier } from '../../utils/tickets';
import MatchLogosV2 from '../MatchLogosV2';

type MatchInfoProps = {
    market: TicketMarket;
    readOnly?: boolean;
    showOddUpdates?: boolean;
    setOddsChanged?: (changed: boolean) => void;
    acceptOdds?: boolean;
    setAcceptOdds?: (accept: boolean) => void;
    isLive?: boolean;
};

const MatchInfo: React.FC<MatchInfoProps> = ({
    market,
    readOnly,
    showOddUpdates,
    setOddsChanged,
    acceptOdds,
    setAcceptOdds,
    isLive,
}) => {
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
        if (acceptOdds) {
            firstClickMarket.current = market;
            setAcceptOdds && setAcceptOdds(false);
        }
    }, [acceptOdds, market, setAcceptOdds]);

    useEffect(() => {
        if (showOddUpdates) {
            if (
                isSameMarket(previousMarket.current, ticketMarketAsTicketPosition(market)) &&
                previousMarket.current.position === market.position
            ) {
                if (market.odd !== previousMarket.current.odd) {
                    if (market.odd < previousMarket.current.odd) {
                        document.getElementById('odd-change-down')?.classList.remove('descend');
                        document.getElementById('odd-change-up')?.classList.remove('rise');
                        setTimeout(() => {
                            document.getElementById('odd-change-up')?.classList.add('rise');
                        });
                    }
                    if (market.odd > previousMarket.current.odd) {
                        document.getElementById('odd-change-down')?.classList.remove('descend');
                        document.getElementById('odd-change-up')?.classList.remove('rise');
                        setTimeout(() => {
                            document.getElementById('odd-change-down')?.classList.add('descend');
                        });
                    }
                    if (
                        !isWithinSlippage(firstClickMarket.current.odd, market.odd, market.live ? liveBetSlippage : 0)
                    ) {
                        setOddsChanged && setOddsChanged(true);
                    }
                }
            } else {
                firstClickMarket.current = market;
                if (market.live) {
                    setOddsChanged && setOddsChanged(false);
                }
            }
            previousMarket.current = market;
        }
    }, [market, market.odd, liveBetSlippage, showOddUpdates, setOddsChanged]);

    const isLiveTicket = market.live || !!isLive;

    return (
        <>
            <LeftContainer>
                {isLiveTicket && <LiveTag readOnly={readOnly}>{t(`markets.market-card.live`)}</LiveTag>}
                <MatchLogosV2
                    market={market}
                    width={readOnly && isLiveTicket ? '52px' : '55px'}
                    height={readOnly && isLiveTicket ? '24px' : '30px'}
                    logoHeight={readOnly && isLiveTicket ? '24px' : undefined}
                    logoWidth={readOnly && isLiveTicket ? '24px' : undefined}
                />
            </LeftContainer>
            <MarketPositionContainer readOnly={readOnly}>
                <MatchLabel readOnly={readOnly} isLive={isLiveTicket}>
                    {matchLabel}
                    {!readOnly && (
                        <CloseIcon
                            className="icon icon--close"
                            onClick={() => {
                                dispatch(removeFromTicket(market));
                            }}
                        />
                    )}
                </MatchLabel>
                <MarketTypeInfo readOnly={readOnly} isLive={isLiveTicket}>
                    {getTitleText(market)}
                </MarketTypeInfo>
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
    bottom: 4px;
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
            transform: scale(1) translateY(2px);
            opacity: 1;
        }
        100% {
            transform: scale(0.9) translateY(-3px);
            opacity: 0.5;
        }
    }
`;

const OddChangeDown = styled.span`
    position: absolute;
    top: 5px;
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
            transform: scale(1) translateY(-3px);
            opacity: 1;
        }
        100% {
            transform: scale(0.9) translateY(2px);
            opacity: 0.5;
        }
    }
`;

const LeftContainer = styled(FlexDivColumn)`
    flex: initial;
    height: 100%;
    justify-content: center;
`;

const LiveTag = styled.span<{ readOnly?: boolean }>`
    background: ${(props) => props.theme.status.live};
    color: ${(props) => props.theme.textColor.primary};
    border-radius: 3px;
    font-weight: 600;
    font-size: 10px;
    height: 12px;
    line-height: 12px;
    padding: ${(props) => (props.readOnly ? '0 12px' : '0 10px')};
    width: fit-content;
    margin-bottom: 5px;
`;

const MarketPositionContainer = styled(FlexDivColumn)<{ readOnly?: boolean }>`
    display: block;
    width: 100%;
    font-size: ${(props) => (props.readOnly ? '11px' : '13px')};
    line-height: ${(props) => (props.readOnly ? '13px' : '13px')};
    @media (max-width: 950px) {
        font-size: ${(props) => (props.readOnly ? '10px' : '13px')};
        line-height: ${(props) => (props.readOnly ? '12px' : '13px')};
    }
`;

const MatchLabel = styled(FlexDivRow)<{ readOnly?: boolean; isLive?: boolean }>`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.primary};
    margin-bottom: ${(props) => (props.readOnly ? '2px' : '5px')};
    text-align: start;
    @media (max-width: 950px) {
        margin-bottom: ${(props) => (props.readOnly ? (props.isLive ? '2px' : '1px') : '5px')};
    }
`;

const MarketTypeInfo = styled(FlexDivRow)<{ readOnly?: boolean; isLive?: boolean }>`
    font-weight: 600;
    color: ${(props) => props.theme.textColor.quinary};
    margin-bottom: ${(props) => (props.readOnly ? '2px' : '5px')};
    @media (max-width: 950px) {
        margin-bottom: ${(props) => (props.readOnly ? (props.isLive ? '2px' : '1px') : '5px')};
    }
`;

const PositionInfo = styled(FlexDivRow)`
    font-weight: 600;
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
    position: absolute;
    top: 12px;
    right: 12px;
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
