import ParlayEmptyIcon from 'assets/images/parlay-empty.svg?react';
import RadioButton from 'components/fields/RadioButton';
import MatchInfoV2 from 'components/MatchInfoV2';
import MatchUnavailableInfo from 'components/MatchUnavailableInfo';
import Scroll from 'components/Scroll';
import Tooltip from 'components/Tooltip';
import { LeagueMap } from 'constants/sports';
import { secondsToMilliseconds } from 'date-fns';
import { SportFilter, StatusFilter, TicketErrorCode } from 'enums/markets';
import { Network } from 'enums/network';
import { League } from 'enums/sports';
import { isEqual } from 'lodash';
import useLiveSportsMarketsQuery from 'queries/markets/useLiveSportsMarketsQuery';
import useSportsAmmDataQuery from 'queries/markets/useSportsAmmDataQuery';
import useSportsMarketsV2Query from 'queries/markets/useSportsMarketsV2Query';
import useSportsAmmRiskManagerQuery from 'queries/riskManagement/useSportsAmmRiskManagerQuery';
import useSgpDataQuery from 'queries/sgp/useSgpDataQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { getIsMobile } from 'redux/modules/app';
import { getSportFilter } from 'redux/modules/market';
import {
    getHasTicketError,
    getIsSgp,
    getIsSystemBet,
    getMaxTicketSize,
    getTicket,
    removeAll,
    resetTicketError,
    setIsSgp,
    setIsSystemBet,
    setMaxTicketSize,
    setTicketError,
} from 'redux/modules/ticket';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivSpaceBetween } from 'styles/common';
import { SportMarket, SportMarkets, TicketMarket, TicketPosition } from 'types/markets';
import { SgpParams, SportsbookData } from 'types/sgp';
import { isSameMarket } from 'utils/marketsV2';
import { isRegularTicketInvalid } from 'utils/tickets';
import { useAccount, useChainId, useClient } from 'wagmi';
import TicketV2 from './components/TicketV2';
import ValidationModal from './components/ValidationModal';

type ParlayProps = {
    onSuccess?: () => void;
    openMarkets?: SportMarkets;
};

const TICKET_MARKETS_LIST_MAX_HEIGHT = 565;
const TICKET_MARKETS_LIST_MAX_HEIGHT_MOBILE = 325;

const Parlay: React.FC<ParlayProps> = ({ onSuccess, openMarkets }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const isMobile = useSelector(getIsMobile);

    const networkId = useChainId();
    const client = useClient();
    const { isConnected } = useAccount();

    const ticket = useSelector(getTicket);
    const maxTicketSize = useSelector(getMaxTicketSize);
    const isSystemBet = useSelector(getIsSystemBet);
    const isSgp = useSelector(getIsSgp);
    const hasTicketError = useSelector(getHasTicketError);
    const sportFilter = useSelector(getSportFilter);
    const isLiveFilterSelected = sportFilter == SportFilter.Live;

    const [ticketMarkets, setTicketMarkets] = useState<TicketMarket[]>([]);
    const [unavailableMarkets, setUnavailableMarkets] = useState<TicketPosition[]>([]);
    const [oddsChanged, setOddsChanged] = useState<boolean>(false);
    const [acceptOdds, setAcceptOdds] = useState<boolean>(false);
    const [outOfLiquidityMarkets, setOutOfLiquidityMarkets] = useState<number[]>([]);
    const [useThalesCollateral, setUseThalesCollateral] = useState(false);

    const isLive = useMemo(() => !!ticket[0]?.live, [ticket]);

    const previousTicketOdds = useRef<{ position: number; odd: number; gameId: string; proof: string[] }[]>([]);

    const sportsAmmDataQuery = useSportsAmmDataQuery({ networkId, client });

    const sportMarketsQuery = useSportsMarketsV2Query(StatusFilter.OPEN_MARKETS, false, { networkId }, undefined, {
        enabled: !!openMarkets,
    });

    const sportMarketsProofsQuery = useSportsMarketsV2Query(StatusFilter.OPEN_MARKETS, true, { networkId }, ticket, {
        enabled: !!ticket.length,
    });

    const liveSportMarketsQuery = useLiveSportsMarketsQuery(isLiveFilterSelected, { networkId });

    const sportsAmmRiskManagerQuery = useSportsAmmRiskManagerQuery(
        ticket[0]?.leagueId || 0,
        { networkId, client },
        { enabled: !!ticket.length }
    );

    const sgpParams: SgpParams =
        ticketMarkets.length > 1
            ? {
                  gameId: ticketMarkets[0].gameId,
                  positions: ticketMarkets.map((market) => market.position),
                  typeIds: ticketMarkets.map((market) => market.typeId),
                  lines: ticketMarkets.map((market) => market.line),
                  playerIds: ticketMarkets.map((market) => market.playerProps.playerId),
              }
            : { gameId: '', positions: [], typeIds: [], lines: [], playerIds: [] };

    const sgpDataQuery = useSgpDataQuery(
        sgpParams,
        { networkId },
        { enabled: isSgp && ticketMarkets.length > 1, refetchInterval: secondsToMilliseconds(10) }
    );

    const sportsbookData: SportsbookData | undefined = useMemo(() => {
        if (sgpDataQuery.isSuccess && sgpDataQuery.data) {
            const selectedSportsbookData = sgpDataQuery.data.data.selectedSportsbook;

            return selectedSportsbookData?.priceWithSpread || selectedSportsbookData?.error
                ? selectedSportsbookData
                : {
                      error: t('markets.parlay.validation.sgp-no-odds'),
                      missingEntries: null,
                      legs: null,
                      price: null,
                      priceWithSpread: null,
                  };
        }
        return undefined;
    }, [sgpDataQuery.isSuccess, sgpDataQuery.data, t]);

    const isDifferentGamesCombined = useMemo(
        () => !ticket.every((ticketPosition) => ticketPosition.gameId === ticket[0].gameId),
        [ticket]
    );
    const isSgpSportDisabled = useMemo(
        () =>
            sportsAmmRiskManagerQuery.isSuccess && sportsAmmRiskManagerQuery.data
                ? !sportsAmmRiskManagerQuery.data.sgpOnLeagueIdEnabled
                : true,
        [sportsAmmRiskManagerQuery.isSuccess, sportsAmmRiskManagerQuery.data]
    );

    useEffect(() => {
        if (sportsAmmDataQuery.isSuccess && sportsAmmDataQuery.data) {
            dispatch(setMaxTicketSize(sportsAmmDataQuery.data.maxTicketSize));
        }
    }, [dispatch, sportsAmmDataQuery.isSuccess, sportsAmmDataQuery.data]);

    useEffect(() => {
        if (isSgp && sportsAmmRiskManagerQuery.data) {
            if (isSgpSportDisabled) {
                const disabledLeagueName = LeagueMap[ticket[0].leagueId as League]?.label;
                dispatch(setTicketError({ code: TicketErrorCode.SGP_LEAGUE_DISABLED, data: disabledLeagueName }));
                dispatch(setIsSgp(false));
            } else {
                dispatch(resetTicketError());
            }
        }
    }, [dispatch, sportsAmmRiskManagerQuery.data, isSgp, isSgpSportDisabled, ticket]);

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
                    sportOpenMarkets.some(
                        (market: SportMarket) =>
                            isSameMarket(market, ticketPosition) && market.odds[ticketPosition.position] !== 0
                    )
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
        if (isLive !== isLiveFilterSelected) {
            dispatch(removeAll());
        }
    }, [isLiveFilterSelected, dispatch, isLive]);

    const onCloseValidationModal = useCallback(() => dispatch(resetTicketError()), [dispatch]);

    const hasParlayMarkets = ticketMarkets.length > 0 || unavailableMarkets.length > 0;

    const marketsList = useRef<HTMLDivElement>(null);
    const marketsListHeight = marketsList.current?.getBoundingClientRect().height;
    const scrollHeight = Math.min(
        isMobile ? TICKET_MARKETS_LIST_MAX_HEIGHT_MOBILE : TICKET_MARKETS_LIST_MAX_HEIGHT,
        marketsListHeight || Number.MAX_VALUE
    );
    const isScrollVisible = !isMobile && (marketsListHeight || 0) > TICKET_MARKETS_LIST_MAX_HEIGHT;

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
                    {!isLive && (
                        <BetTypeContainer>
                            <Tooltip overlay={t('markets.parlay.tooltip.regular')} mouseEnterDelay={0.3}>
                                <RadioButtonContainer>
                                    <RadioButton
                                        checked={!isSystemBet && !isSgp}
                                        value={'true'}
                                        onChange={() => {
                                            if (isSgp && ticket.length > 1) {
                                                if (isRegularTicketInvalid(ticket, maxTicketSize)) {
                                                    dispatch(removeAll());
                                                }
                                            }
                                            dispatch(setIsSystemBet(false));
                                            dispatch(setIsSgp(false));
                                            // reset odds changes
                                            setAcceptOdds(true);
                                            setOddsChanged(false);
                                        }}
                                        label={t('markets.parlay.regular')}
                                    />
                                </RadioButtonContainer>
                            </Tooltip>
                            <Tooltip overlay={t('markets.parlay.tooltip.system')} mouseEnterDelay={0.3}>
                                <RadioButtonContainer>
                                    <RadioButton
                                        checked={isSystemBet}
                                        value={'false'}
                                        onChange={() => {
                                            if (isSgp && ticket.length > 1) {
                                                if (isRegularTicketInvalid(ticket, maxTicketSize)) {
                                                    dispatch(removeAll());
                                                }
                                            }
                                            dispatch(setIsSystemBet(true));
                                            dispatch(setIsSgp(false));
                                            // reset odds changes
                                            setAcceptOdds(true);
                                            setOddsChanged(false);
                                        }}
                                        label={t('markets.parlay.system')}
                                    />
                                </RadioButtonContainer>
                            </Tooltip>
                            <Tooltip
                                overlay={
                                    isDifferentGamesCombined
                                        ? t('markets.parlay.tooltip.sgp-different-game')
                                        : isSgpSportDisabled
                                        ? t('markets.parlay.tooltip.sgp-league-disabled', {
                                              league: LeagueMap[ticket[0]?.leagueId as League]?.label,
                                          })
                                        : t('markets.parlay.tooltip.sgp')
                                }
                                mouseEnterDelay={0.3}
                            >
                                <RadioButtonContainer>
                                    <BetaTag>beta</BetaTag>
                                    <RadioButton
                                        checked={isSgp}
                                        disabled={isDifferentGamesCombined || isSgpSportDisabled}
                                        value={'false'}
                                        onChange={() => {
                                            dispatch(setIsSystemBet(false));
                                            dispatch(setIsSgp(true));
                                            // reset odds changes
                                            setAcceptOdds(true);
                                            setOddsChanged(false);
                                        }}
                                        label={t('markets.parlay.sgp')}
                                    />
                                </RadioButtonContainer>
                            </Tooltip>
                        </BetTypeContainer>
                    )}
                    {networkId !== Network.Base && (
                        <ThalesBonusContainer>
                            <ThalesBonus>{t('markets.parlay.thales-bonus-info')}</ThalesBonus>
                        </ThalesBonusContainer>
                    )}
                    <ScrollContainer>
                        <Scroll height={`${scrollHeight}px`} renderOnlyChildren={!isScrollVisible}>
                            <ListContainer ref={marketsList} isScrollVisible={isScrollVisible}>
                                {ticketMarkets.length > 0 &&
                                    ticketMarkets.map((market, index) => {
                                        const outOfLiquidity = outOfLiquidityMarkets.includes(index);
                                        return (
                                            <RowMarket key={index} outOfLiquidity={outOfLiquidity}>
                                                <MatchInfoV2
                                                    market={market}
                                                    showOddUpdates={!isSgp}
                                                    setOddsChanged={setOddsChanged}
                                                    acceptOdds={acceptOdds}
                                                    setAcceptOdds={setAcceptOdds}
                                                    isSgp={isSgp}
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
                                                    acceptOdds={acceptOdds}
                                                    setAcceptOdds={setAcceptOdds}
                                                    applyPayoutMultiplier={true}
                                                />
                                            </RowMarket>
                                        );
                                    })}
                            </ListContainer>
                        </Scroll>
                    </ScrollContainer>
                    <TicketV2
                        markets={ticketMarkets}
                        setMarketsOutOfLiquidity={setOutOfLiquidityMarkets}
                        oddsChanged={oddsChanged}
                        setOddsChanged={setOddsChanged}
                        acceptOddChanges={(changed: boolean) => {
                            setAcceptOdds(true);
                            setOddsChanged(changed);
                        }}
                        onSuccess={onSuccess}
                        submitButtonDisabled={!!unavailableMarkets.length}
                        setUseThalesCollateral={setUseThalesCollateral}
                        sgpData={isSgp ? sportsbookData : undefined}
                    />
                </>
            ) : (
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

const ScrollContainer = styled.div`
    margin-bottom: 11px;
`;

const ListContainer = styled(FlexDivColumn)<{ isScrollVisible: boolean }>`
    ${(props) => (props.isScrollVisible ? 'padding-right: 10px;' : '')}
`;

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
        margin-bottom: 0;
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

const BetTypeContainer = styled(FlexDivSpaceBetween)``;

const RadioButtonContainer = styled.div`
    position: relative;

    label {
        padding-left: 26px;
        font-size: 14px;
        line-height: 20px;
        min-height: 24px;
        text-transform: uppercase;
        margin-bottom: 0px;
        :first-child {
            margin-bottom: 4px;
        }
    }
    .checkmark {
        height: 18px;
        width: 18px;
        border: 2px solid ${(props) => props.theme.borderColor.quaternary};
        :after {
            left: 3px;
            top: 3px;
            width: 8px;
            height: 8px;
            background: ${(props) => props.theme.borderColor.quaternary};
        }
    }
`;

const BetaTag = styled.div`
    position: absolute;
    top: -14px;
    right: 0;
    background-color: ${(props) => props.theme.tag.background.primary};
    border-radius: 5px;
    color: ${(props) => props.theme.tag.textColor.primary};
    display: inline-block;
    font-size: 10px;
    line-height: 10px;
    padding: 2px 4px;
`;

export default Parlay;
