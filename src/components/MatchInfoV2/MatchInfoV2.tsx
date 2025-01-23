import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getLiveBetSlippage, getTicketPayment, removeFromTicket } from 'redux/modules/ticket';
import { getOddsType } from 'redux/modules/ui';
import { Coins } from 'thales-utils';
import { TicketMarket } from 'types/markets';
import { getCollateral } from 'utils/collaterals';
import { formatMarketOdds, isWithinSlippage } from 'utils/markets';
import {
    getMatchLabel,
    getPositionTextV2,
    getTitleText,
    isSameMarket,
    sportMarketAsSerializable,
    ticketMarketAsTicketPosition,
} from 'utils/marketsV2';
import { getAddedPayoutOdds } from 'utils/tickets';
import { useChainId } from 'wagmi';
import MatchLogosV2 from '../MatchLogosV2';
import {
    Canceled,
    CloseIcon,
    Correct,
    Empty,
    LeftContainer,
    LiveTag,
    MarketPositionContainer,
    MarketTypeInfo,
    MatchLabel,
    Odd,
    OddChangeDown,
    OddChangeUp,
    PositionInfo,
    PositionText,
    Wrong,
} from './styled-components';

type MatchInfoProps = {
    market: TicketMarket;
    readOnly?: boolean;
    showOddUpdates?: boolean;
    setOddsChanged?: (changed: boolean) => void;
    acceptOdds?: boolean;
    setAcceptOdds?: (accept: boolean) => void;
    isLive?: boolean;
    applyPayoutMultiplier: boolean;
    useThalesCollateral?: boolean;
};

const MatchInfo: React.FC<MatchInfoProps> = ({
    market,
    readOnly,
    showOddUpdates,
    setOddsChanged,
    acceptOdds,
    setAcceptOdds,
    isLive,
    applyPayoutMultiplier,
    useThalesCollateral,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const networkId = useChainId();
    const selectedOddsType = useSelector(getOddsType);
    const matchLabel = getMatchLabel(market);
    const ticketPayment = useSelector(getTicketPayment);
    const liveBetSlippage = useSelector(getLiveBetSlippage);
    const selectedCollateral = useMemo(() => getCollateral(networkId, ticketPayment.selectedCollateralIndex), [
        networkId,
        ticketPayment.selectedCollateralIndex,
    ]);
    const positionText = getPositionTextV2(market, market.position, true);

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
                                const serializableMarket = sportMarketAsSerializable(market);
                                dispatch(removeFromTicket(serializableMarket));
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
                        {formatMarketOdds(
                            selectedOddsType,
                            applyPayoutMultiplier
                                ? getAddedPayoutOdds(
                                      useThalesCollateral ? (CRYPTO_CURRENCY_MAP.THALES as Coins) : selectedCollateral,
                                      market.odd
                                  )
                                : market.odd
                        )}
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

export default MatchInfo;
