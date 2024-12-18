import ParlayEmptyIcon from 'assets/images/parlay-empty.svg?react';
import MatchInfoV2 from 'components/MatchInfoV2';
import MatchUnavailableInfo from 'components/MatchUnavailableInfo';
import Toggle from 'components/Toggle';
import { SportFilter, StatusFilter } from 'enums/markets';
import { isEqual } from 'lodash';
import useLiveSportsMarketsQuery from 'queries/markets/useLiveSportsMarketsQuery';
import useSportsAmmDataQuery from 'queries/markets/useSportsAmmDataQuery';
import useSportsMarketsV2Query from 'queries/markets/useSportsMarketsV2Query';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getSportFilter } from 'redux/modules/market';
import {
    getHasTicketError,
    getIsSystemBet,
    getTicket,
    removeAll,
    resetTicketError,
    setIsSystemBet,
    setMaxTicketSize,
} from 'redux/modules/ticket';
import styled, { useTheme } from 'styled-components';
import { FlexDiv, FlexDivCentered, FlexDivColumn } from 'styles/common';
import { SportMarket, SportMarkets, TicketMarket, TicketPosition } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { isSameMarket } from 'utils/marketsV2';
import { useAccount, useChainId, useClient } from 'wagmi';
import TicketV2 from './components/TicketV2';
import ValidationModal from './components/ValidationModal';

type ParlayProps = {
    onSuccess?: () => void;
    openMarkets?: SportMarkets;
};

const Parlay: React.FC<ParlayProps> = ({ onSuccess, openMarkets }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector(getIsMobile);

    const networkId = useChainId();
    const client = useClient();
    const { isConnected } = useAccount();

    const ticket = useSelector(getTicket);
    const isSystemBet = useSelector(getIsSystemBet);
    const hasTicketError = useSelector(getHasTicketError);
    const sportFilter = useSelector(getSportFilter);
    const isLiveFilterSelected = sportFilter == SportFilter.Live;

    const [ticketMarkets, setTicketMarkets] = useState<TicketMarket[]>([]);
    const [unavailableMarkets, setUnavailableMarkets] = useState<TicketPosition[]>([]);
    const [oddsChanged, setOddsChanged] = useState<boolean>(false);
    const [acceptOdds, setAcceptOdds] = useState<boolean>(false);
    const [outOfLiquidityMarkets, setOutOfLiquidityMarkets] = useState<number[]>([]);
    const [useThalesCollateral, setUseThalesCollateral] = useState(false);

    const previousTicketOdds = useRef<{ position: number; odd: number; gameId: string; proof: string[] }[]>([]);

    const sportsAmmDataQuery = useSportsAmmDataQuery({ networkId, client });

    const sportMarketsQuery = useSportsMarketsV2Query(StatusFilter.OPEN_MARKETS, false, { networkId }, undefined, {
        enabled: !!openMarkets,
    });

    const sportMarketsProofsQuery = useSportsMarketsV2Query(StatusFilter.OPEN_MARKETS, true, { networkId }, ticket, {
        enabled: !!ticket.length,
    });

    const liveSportMarketsQuery = useLiveSportsMarketsQuery(isLiveFilterSelected, { networkId });

    useEffect(() => {
        if (sportsAmmDataQuery.isSuccess && sportsAmmDataQuery.data) {
            dispatch(setMaxTicketSize(sportsAmmDataQuery.data.maxTicketSize));
        }
    }, [dispatch, sportsAmmDataQuery.isSuccess, sportsAmmDataQuery.data]);

    // Reset states when empty ticket
    useEffect(() => {
        if (!ticket.length) {
            setOddsChanged(false);
            setUnavailableMarkets([]);
            setOutOfLiquidityMarkets([]);
            setUseThalesCollateral(false);
        }
    }, [ticket]);

    // Live matches
    useEffect(() => {
        if (liveSportMarketsQuery.isSuccess && liveSportMarketsQuery.data && isLiveFilterSelected) {
            const liveSportOpenMarkets = liveSportMarketsQuery.data.live.reduce(
                (acc: SportMarket[], market: SportMarket) => {
                    acc.push(market);
                    market.childMarkets.forEach((childMarket: SportMarket) => {
                        acc.push(childMarket);
                    });
                    return acc;
                },
                []
            );

            const openTicketMarketsWithOdds: TicketMarket[] = ticket
                .filter((ticketPosition) =>
                    liveSportOpenMarkets.some(
                        (market: SportMarket) =>
                            market.odds.some((odd) => odd !== 0) && isSameMarket(market, ticketPosition)
                    )
                )
                .map((ticketPosition) => {
                    const openMarket: SportMarket = liveSportOpenMarkets.filter((market: SportMarket) =>
                        isSameMarket(market, ticketPosition)
                    )[0];
                    return {
                        ...openMarket,
                        position: ticketPosition.position,
                        odd: openMarket.odds[ticketPosition.position],
                    };
                });

            if (ticket.length > openTicketMarketsWithOdds.length) {
                const marketsUnavailable = ticket.filter((ticketPosition) =>
                    openTicketMarketsWithOdds.every((market: SportMarket) => !isSameMarket(market, ticketPosition))
                );

                setUnavailableMarkets(marketsUnavailable);
            } else {
                setUnavailableMarkets([]);
            }

            const ticketOdds = openTicketMarketsWithOdds.map((market) => ({
                odd: market.odd,
                position: market.position,
                gameId: market.gameId,
                proof: [],
            }));

            if (!isEqual(previousTicketOdds.current, ticketOdds)) {
                setTicketMarkets(openTicketMarketsWithOdds);
                previousTicketOdds.current = ticketOdds;
            }
        }
    }, [isLiveFilterSelected, liveSportMarketsQuery.data, liveSportMarketsQuery.isSuccess, ticket]);

    const sportMarkets = useMemo(() => {
        if (sportMarketsProofsQuery.isSuccess && sportMarketsProofsQuery.data) {
            return sportMarketsProofsQuery.data[StatusFilter.OPEN_MARKETS];
        }
        if (openMarkets) {
            return openMarkets;
        }
        if (sportMarketsQuery.isSuccess && sportMarketsQuery.data) {
            return sportMarketsQuery.data[StatusFilter.OPEN_MARKETS];
        }
        return undefined;
    }, [
        openMarkets,
        sportMarketsProofsQuery.data,
        sportMarketsProofsQuery.isSuccess,
        sportMarketsQuery.data,
        sportMarketsQuery.isSuccess,
    ]);

    // Non-Live matches
    useEffect(() => {
        if (sportMarkets && !isLiveFilterSelected) {
            const sportOpenMarkets = sportMarkets.reduce((acc: SportMarket[], market: SportMarket) => {
                acc.push(market);
                market.childMarkets.forEach((childMarket: SportMarket) => {
                    acc.push(childMarket);
                });
                return acc;
            }, []);

            const openTicketMarkets: TicketMarket[] = ticket
                .filter((ticketPosition) =>
                    sportOpenMarkets.some((market: SportMarket) => isSameMarket(market, ticketPosition))
                )
                .map((ticketPosition) => {
                    const openMarket: SportMarket = sportOpenMarkets.filter((market: SportMarket) =>
                        isSameMarket(market, ticketPosition)
                    )[0];
                    return {
                        ...openMarket,
                        position: ticketPosition.position,
                        odd: openMarket.odds[ticketPosition.position],
                    };
                });

            if (ticket.length > openTicketMarkets.length) {
                const notOpenedMarkets = ticket.filter((ticketPosition) =>
                    openTicketMarkets.every((market: SportMarket) => !isSameMarket(market, ticketPosition))
                );

                setUnavailableMarkets(notOpenedMarkets);
            } else {
                setUnavailableMarkets([]);
            }

            const ticketOdds = openTicketMarkets.map((market) => ({
                odd: market.odd,
                position: market.position,
                gameId: market.gameId,
                proof: market.proof,
            }));

            if (!isEqual(previousTicketOdds.current, ticketOdds)) {
                setTicketMarkets(openTicketMarkets);
                previousTicketOdds.current = ticketOdds;
            }
        }
    }, [sportMarkets, ticket, dispatch, isLiveFilterSelected]);

    useEffect(() => {
        if (ticket[0] && ticket[0].live && !isLiveFilterSelected) {
            dispatch(removeAll());
        } else if (ticket[0] && !ticket[0].live && isLiveFilterSelected) {
            dispatch(removeAll());
        }
    }, [isLiveFilterSelected, dispatch, ticket]);

    const onCloseValidationModal = useCallback(() => dispatch(resetTicketError()), [dispatch]);

    const hasParlayMarkets = ticketMarkets.length > 0 || unavailableMarkets.length > 0;

    return (
        <Container isMobile={isMobile} isWalletConnected={isConnected}>
            {hasParlayMarkets ? (
                <>
                    {!isMobile && (
                        <Title>
                            {t('markets.parlay.ticket-slip')}
                            <Count>{ticket.length}</Count>
                        </Title>
                    )}
                    {!ticket[0]?.live && (
                        <ToggleContainer>
                            <Toggle
                                label={{
                                    firstLabel: t('markets.parlay.regular'),
                                    secondLabel: t('markets.parlay.system'),
                                    fontSize: '14px',
                                }}
                                width="46px"
                                height="24px"
                                active={isSystemBet}
                                dotSize="16px"
                                dotBackground={theme.background.secondary}
                                dotBorder={`3px solid ${theme.borderColor.quaternary}`}
                                dotMargin="3px"
                                handleClick={() => {
                                    dispatch(setIsSystemBet(!isSystemBet));
                                }}
                            />
                        </ToggleContainer>
                    )}
                    <ThalesBonusContainer>
                        <ThalesBonus>{t('markets.parlay.thales-bonus-info')}</ThalesBonus>
                    </ThalesBonusContainer>
                    <ListContainer>
                        {ticketMarkets.length > 0 &&
                            ticketMarkets.map((market, index) => {
                                const outOfLiquidity = outOfLiquidityMarkets.includes(index);
                                return (
                                    <RowMarket key={index} outOfLiquidity={outOfLiquidity}>
                                        <MatchInfoV2
                                            market={market}
                                            showOddUpdates
                                            setOddsChanged={setOddsChanged}
                                            acceptOdds={acceptOdds}
                                            setAcceptOdds={setAcceptOdds}
                                            applyPayoutMultiplier={true}
                                            useThalesCollateral={useThalesCollateral}
                                        />
                                    </RowMarket>
                                );
                            })}
                        {unavailableMarkets.length > 0 &&
                            unavailableMarkets.map((market, index) => {
                                return (
                                    <RowMarket key={index} outOfLiquidity={false} notOpened={true}>
                                        <MatchUnavailableInfo
                                            market={market}
                                            showOddUpdates
                                            setOddsChanged={setOddsChanged}
                                            acceptOdds={acceptOdds}
                                            setAcceptOdds={setAcceptOdds}
                                            applyPayoutMultiplier={true}
                                        />
                                    </RowMarket>
                                );
                            })}
                    </ListContainer>
                    <TicketV2
                        markets={ticketMarkets}
                        setMarketsOutOfLiquidity={setOutOfLiquidityMarkets}
                        oddsChanged={oddsChanged}
                        acceptOddChanges={(changed: boolean) => {
                            setAcceptOdds(true);
                            setOddsChanged(changed);
                        }}
                        onSuccess={onSuccess}
                        submitButtonDisabled={!!unavailableMarkets.length}
                        setUseThalesCollateral={setUseThalesCollateral}
                    />
                </>
            ) : (
                <>
                    <Empty>
                        <EmptyLabel>{t('markets.parlay.empty-title')}</EmptyLabel>
                        <StyledParlayEmptyIcon
                            style={{
                                marginTop: 10,
                                marginBottom: 20,
                                width: '100px',
                                height: '100px',
                            }}
                        />
                        <EmptyDesc>{t('markets.parlay.empty-description')}</EmptyDesc>
                    </Empty>
                </>
            )}
            {hasTicketError && <ValidationModal onClose={onCloseValidationModal} />}
        </Container>
    );
};

const Container = styled(FlexDivColumn)<{ isMobile: boolean; isWalletConnected?: boolean }>`
    max-width: 360px;
    padding: 12px;
    flex: none;
    background: ${(props) => props.theme.background.quinary};
    border-radius: 7px;
    @media (max-width: 1199px) {
        max-width: 320px;
    }
    @media (max-width: 950px) {
        max-width: 100%;
        padding-bottom: 40px;
    }
`;

const Title = styled(FlexDivCentered)`
    color: ${(props) => props.theme.textColor.septenary};
    font-weight: 600;
    font-size: 14px;
    line-height: 16px;
    text-transform: uppercase;
    height: 20px;
    margin-bottom: 10px;
`;

const Count = styled(FlexDivCentered)`
    border-radius: 8px;
    min-width: 20px;
    color: ${(props) => props.theme.textColor.tertiary};
    background: ${(props) => props.theme.background.quaternary};
    padding: 0 5px;
    margin-left: 6px;
`;

const ThalesBonusContainer = styled(FlexDivCentered)`
    background: ${(props) => props.theme.background.quaternary};
    color: ${(props) => props.theme.textColor.tertiary};
    min-width: 100%;
    border-radius: 5px;
    padding: 3px 10px;
    margin-bottom: 10px;
`;

const ThalesBonus = styled.span`
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
    padding-right: 2px;
    overflow: hidden; /* Ensures the content is not revealed until the animation */
    border-right: 0.15em solid ${(props) => props.theme.borderColor.primary}; /* The typwriter cursor */
    white-space: nowrap; /* Keeps the content on a single line */
    margin: 0 auto; /* Gives that scrolling effect as the typing happens */
    animation: typing 3.5s steps(40, end), blink-caret 0.75s step-end infinite;

    /* The typing effect */
    @keyframes typing {
        from {
            width: 0;
        }
        to {
            width: 320px;
        }
    }

    /* The typewriter cursor effect */
    @keyframes blink-caret {
        from,
        to {
            border-color: transparent;
        }
        50% {
            border-color: ${(props) => props.theme.borderColor.primary};
        }
    }
`;

const ListContainer = styled(FlexDivColumn)``;

const RowMarket = styled.div<{ outOfLiquidity: boolean; notOpened?: boolean }>`
    display: flex;
    position: relative;
    // height: 45px;
    align-items: center;
    text-align: center;
    padding: ${(props) => (props.outOfLiquidity ? '6px 8px' : '8px 10px')};
    background: ${(props) =>
        props.outOfLiquidity
            ? props.theme.background.quinary
            : props.notOpened
            ? props.theme.error.borderColor.primary
            : props.theme.background.secondary};
    ${(props) => (props.outOfLiquidity ? `border: 2px solid ${props.theme.status.loss};` : '')}
    margin-bottom: 11px;
    :first-child {
        border-radius: 5px 5px 0 0;
    }
    :last-child {
        border-radius: 0 0 5px 5px;
    }
    :first-child:last-child {
        border-radius: 5px;
    }
    :not(:first-child) {
        :before {
            content: '';
            position: absolute;
            left: 0;
            height: 6px;
            width: 100%;
            top: -4px;
            background: radial-gradient(
                    circle,
                    transparent,
                    transparent 50%,
                    ${(props) =>
                            props.notOpened ? props.theme.error.borderColor.primary : props.theme.background.secondary}
                        50%,
                    ${(props) =>
                            props.notOpened ? props.theme.error.borderColor.primary : props.theme.background.secondary}
                        100%
                )
                0px -6px / 0.7rem 0.7rem repeat-x;
        }
    }
    :not(:last-child) {
        :after {
            content: '';
            position: absolute;
            left: 0;
            height: 6px;
            width: 100%;
            bottom: -4px;
            background: radial-gradient(
                    circle,
                    transparent,
                    transparent 50%,
                    ${(props) =>
                            props.notOpened ? props.theme.error.borderColor.primary : props.theme.background.secondary}
                        50%,
                    ${(props) =>
                            props.notOpened ? props.theme.error.borderColor.primary : props.theme.background.secondary}
                        100%
                )
                0px 1px / 0.7rem 0.7rem repeat-x;
        }
    }
`;

const Empty = styled(FlexDivColumn)`
    align-items: center;
    margin-bottom: 40px;
`;

const EmptyLabel = styled.span`
    font-style: normal;
    font-weight: 600;
    font-size: 20px;
    line-height: 38px;
    letter-spacing: 0.025em;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.quaternary};
    text-align: center;
`;

const EmptyDesc = styled.span`
    width: 80%;
    text-align: center;
    font-style: normal;
    font-weight: 400;
    font-size: 14px;
    line-height: 14px;
    letter-spacing: 0.025em;
    color: ${(props) => props.theme.textColor.quaternary};
`;

const StyledParlayEmptyIcon = styled(ParlayEmptyIcon)`
    margin-top: 10;
    margin-bottom: 20;
    width: 100px;
    height: 100px;
    path {
        fill: ${(props) => props.theme.textColor.quaternary};
    }
`;

const ToggleContainer = styled(FlexDiv)`
    font-weight: 600;
    width: 100%;
    margin-bottom: 5px;
    text-transform: uppercase;
`;

export default Parlay;
