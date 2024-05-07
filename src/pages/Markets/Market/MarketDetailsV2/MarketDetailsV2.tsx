import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import FooterSidebarMobile from 'components/FooterSidebarMobile';
import Toggle from 'components/Toggle';
import Tooltip from 'components/Tooltip';
import { INCENTIVIZED_LEAGUE, INCENTIVIZED_MLB, INCENTIVIZED_NHL, INCENTIVIZED_UEFA } from 'constants/markets';
import ROUTES from 'constants/routes';
import { ENETPULSE_SPORTS, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP, SPORT_PERIODS_MAP, TAGS_LIST } from 'constants/tags';
import { GAME_STATUS } from 'constants/ui';
import { BetType } from 'enums/markets';
import { Network } from 'enums/network';
import { groupBy } from 'lodash';
import { ToggleContainer } from 'pages/LiquidityPool/styled-components';
import Parlay from 'pages/Markets/Home/Parlay';
import ParlayMobileModal from 'pages/Markets/Home/Parlay/components/ParlayMobileModal';
import BackToLink from 'pages/Markets/components/BackToLink';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import queryString from 'query-string';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { NetworkId } from 'thales-utils';
import { SportMarketInfoV2, TagInfo } from 'types/markets';
import { ThemeInterface } from 'types/ui';
import { buildHref, navigateTo } from 'utils/routes';
import { getOrdinalNumberLabel } from 'utils/ui';
import useQueryParam from 'utils/useQueryParams';
import web3 from 'web3';
import { SportMarketLiveResult } from '../../../../types/markets';
import MatchInfoV2 from './components/MatchInfoV2';
import PositionsV2 from './components/PositionsV2';
import TicketTransactions from './components/TicketTransactions';

type MarketDetailsPropType = {
    market: SportMarketInfoV2;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const queryParams: { title?: string } = queryString.parse(location.search);

    const [metaTitle, setMetaTitle] = useQueryParam('title', queryParams?.title ? queryParams?.title : '');
    const [showParlayMobileModal, setShowParlayMobileModal] = useState(false);
    const [hidePausedMarkets, setHidePausedMarkets] = useState(true);

    const groupedChildMarkets = useMemo(
        () =>
            groupBy(
                market.childMarkets.filter((childMarket) =>
                    hidePausedMarkets && market.isOpen && market.maturityDate > new Date()
                        ? !childMarket.isPaused
                        : true
                ),
                (childMarket) => childMarket.typeId
            ),
        [market.childMarkets, market.isOpen, market.maturityDate, hidePausedMarkets]
    );

    useEffect(() => {
        if (!metaTitle) {
            setMetaTitle(`${market.homeTeam} vs ${market.awayTeam}`);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [market.awayTeam, market.homeTeam]);

    const isMounted = useRef(false);
    useEffect(() => {
        // skip first render
        if (isMounted.current) {
            navigateTo(ROUTES.Markets.Home);
        } else {
            isMounted.current = true;
        }
    }, [networkId]);

    const isGameStarted = market.maturityDate < new Date();
    const isGameOpen = market.isOpen && !isGameStarted;

    const leagueName = TAGS_LIST.find((t: TagInfo) => t.id == market.leagueId)?.label;
    const isGameCancelled = market.isCanceled || (!isGameStarted && market.isResolved);
    const isGameResolved = market.isResolved || market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const isGamePaused = market.isPaused && !isGameResolved;
    const showStatus = market.isResolved || market.isCanceled || isGameStarted || market.isPaused;
    const gameIdString = web3.utils.hexToAscii(market.gameId);
    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.leagueId));
    const isJsonOddsSport = JSON_ODDS_SPORTS.includes(Number(market.leagueId));
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];
    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);

    const useLiveResultQuery = useSportMarketLiveResultQuery(gameIdString, {
        enabled: isAppReady && !isEnetpulseSport && !isJsonOddsSport,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(gameIdString, gameDate, market.leagueId, {
        enabled: isAppReady && isEnetpulseSport,
    });

    useEffect(() => {
        if (isEnetpulseSport) {
            if (useEnetpulseLiveResultQuery.isSuccess && useEnetpulseLiveResultQuery.data) {
                setLiveResultInfo(useEnetpulseLiveResultQuery.data);
            }
        } else {
            if (useLiveResultQuery.isSuccess && useLiveResultQuery.data) {
                setLiveResultInfo(useLiveResultQuery.data);
            }
        }
    }, [
        useLiveResultQuery,
        useLiveResultQuery.data,
        useEnetpulseLiveResultQuery,
        useEnetpulseLiveResultQuery.data,
        isEnetpulseSport,
    ]);

    const hideResultInfoPerPeriod = hideResultInfoPerPeriodForSports(Number(liveResultInfo?.sportId));

    return (
        <RowContainer>
            <MainContainer isGameOpen={isGameOpen}>
                <HeaderWrapper>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('market.back')}
                        customStylingContainer={{ position: 'absolute', left: 0, top: 0, marginTop: 0 }}
                    />
                    {INCENTIVIZED_LEAGUE.ids.includes(Number(market.leagueId)) &&
                        new Date(market.maturityDate) > INCENTIVIZED_LEAGUE.startDate &&
                        new Date(market.maturityDate) < INCENTIVIZED_LEAGUE.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip"
                                        components={{
                                            detailsLink: (
                                                <a href={INCENTIVIZED_LEAGUE.link} target="_blank" rel="noreferrer" />
                                            ),
                                        }}
                                        values={{
                                            rewards:
                                                networkId == Network.OptimismMainnet
                                                    ? INCENTIVIZED_LEAGUE.opRewards
                                                    : networkId == Network.Arbitrum
                                                    ? INCENTIVIZED_LEAGUE.thalesRewards
                                                    : '',
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        {networkId !== Network.Base ? (
                                            <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        ) : (
                                            ''
                                        )}
                                        {getNetworkLogo(networkId)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                    {INCENTIVIZED_UEFA.ids.includes(Number(market.leagueId)) &&
                        new Date() > INCENTIVIZED_UEFA.startDate &&
                        new Date() < INCENTIVIZED_UEFA.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip-uefa"
                                        components={{
                                            detailsLink: (
                                                <a href={INCENTIVIZED_UEFA.link} target="_blank" rel="noreferrer" />
                                            ),
                                        }}
                                        values={{
                                            rewards: INCENTIVIZED_UEFA.arbRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {getNetworkLogo(NetworkId.Arbitrum)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                    {INCENTIVIZED_NHL.ids.includes(Number(market.leagueId)) &&
                        new Date() > INCENTIVIZED_NHL.startDate &&
                        new Date() < INCENTIVIZED_NHL.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip-nhl-mlb"
                                        components={{
                                            detailsLink: (
                                                <a href={INCENTIVIZED_NHL.link} target="_blank" rel="noreferrer" />
                                            ),
                                        }}
                                        values={{
                                            league: leagueName,
                                            rewards: INCENTIVIZED_NHL.arbRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {getNetworkLogo(NetworkId.Arbitrum)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                    {INCENTIVIZED_MLB.ids.includes(Number(market.leagueId)) &&
                        new Date() > INCENTIVIZED_MLB.startDate &&
                        new Date() < INCENTIVIZED_MLB.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip-nhl-mlb"
                                        components={{
                                            detailsLink: (
                                                <a href={INCENTIVIZED_MLB.link} target="_blank" rel="noreferrer" />
                                            ),
                                        }}
                                        values={{
                                            league: leagueName,
                                            rewards: INCENTIVIZED_MLB.arbRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {getNetworkLogo(NetworkId.Arbitrum)}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                </HeaderWrapper>
                <MatchInfoV2 market={market} liveResultInfo={liveResultInfo} isEnetpulseSport={isEnetpulseSport} />
                {showStatus && (
                    <Status backgroundColor={isGameCancelled ? theme.status.canceled : theme.background.secondary}>
                        {isPendingResolution ? (
                            !isEnetpulseSport && !isJsonOddsSport ? (
                                <ResultContainer>
                                    <ResultLabel>
                                        {liveResultInfo?.homeScore + ' - ' + liveResultInfo?.awayScore}{' '}
                                        {SPORTS_TAGS_MAP['Soccer'].includes(Number(liveResultInfo?.sportId)) &&
                                            liveResultInfo?.period == 2 && (
                                                <InfoLabel className="football">
                                                    {'(' +
                                                        liveResultInfo?.scoreHomeByPeriod[0] +
                                                        ' - ' +
                                                        liveResultInfo?.scoreAwayByPeriod[0] +
                                                        ')'}
                                                </InfoLabel>
                                            )}
                                    </ResultLabel>
                                    {liveResultInfo?.status != GAME_STATUS.FINAL &&
                                        liveResultInfo?.status != GAME_STATUS.FULL_TIME && (
                                            <PeriodsContainer>
                                                {liveResultInfo?.status == GAME_STATUS.HALF_TIME && (
                                                    <InfoLabel>{t('markets.market-card.half-time')}</InfoLabel>
                                                )}
                                                {liveResultInfo?.status != GAME_STATUS.HALF_TIME && (
                                                    <>
                                                        <InfoLabel>
                                                            {` ${getOrdinalNumberLabel(
                                                                Number(liveResultInfo?.period)
                                                            )} ${t(
                                                                `markets.market-card.${
                                                                    SPORT_PERIODS_MAP[Number(liveResultInfo?.sportId)]
                                                                }`
                                                            )}`}
                                                        </InfoLabel>
                                                        <InfoLabel className="red">
                                                            {liveResultInfo?.displayClock.replaceAll("'", '')}
                                                            <InfoLabel className="blink">&prime;</InfoLabel>
                                                        </InfoLabel>
                                                    </>
                                                )}
                                            </PeriodsContainer>
                                        )}
                                    {!SPORTS_TAGS_MAP['Soccer'].includes(Number(liveResultInfo?.sportId)) && (
                                        <FlexDivRow>
                                            {liveResultInfo?.scoreHomeByPeriod.map((homePeriodResult, index) => {
                                                return (
                                                    <PeriodContainer key={index}>
                                                        <InfoLabel className="gray">{index + 1}</InfoLabel>
                                                        <InfoLabel>{homePeriodResult}</InfoLabel>
                                                        <InfoLabel>{liveResultInfo.scoreAwayByPeriod[index]}</InfoLabel>
                                                    </PeriodContainer>
                                                );
                                            })}
                                        </FlexDivRow>
                                    )}
                                </ResultContainer>
                            ) : (
                                t('markets.market-card.pending')
                            )
                        ) : isGameCancelled ? (
                            t('markets.market-card.canceled')
                        ) : isGamePaused ? (
                            t('markets.market-card.paused')
                        ) : (
                            <ResultContainer>
                                <ResultLabel>
                                    {market.isOneSideMarket
                                        ? market.homeScore == 1
                                            ? t('markets.market-card.race-winner')
                                            : t('markets.market-card.no-win')
                                        : Number(liveResultInfo?.sportId) != 9007
                                        ? `${market.homeScore} - ${market.awayScore}`
                                        : ''}
                                    {SPORTS_TAGS_MAP['Soccer'].includes(Number(liveResultInfo?.sportId)) &&
                                        liveResultInfo?.period == 2 && (
                                            <InfoLabel className="football">
                                                {'(' +
                                                    liveResultInfo?.scoreHomeByPeriod[0] +
                                                    ' - ' +
                                                    liveResultInfo?.scoreAwayByPeriod[0] +
                                                    ')'}
                                            </InfoLabel>
                                        )}
                                    {Number(liveResultInfo?.sportId) == 9007 ? (
                                        <>
                                            {Number(market.homeScore) > 0 ? 'W - L' : 'L - W'}
                                            <InfoLabel className="ufc">
                                                {`(${t('market.number-of-rounds')}: ` +
                                                    `${
                                                        Number(market.homeScore) > 0
                                                            ? market.homeScore
                                                            : market.awayScore
                                                    }` +
                                                    ')'}
                                            </InfoLabel>
                                        </>
                                    ) : (
                                        ''
                                    )}
                                </ResultLabel>
                                {hideResultInfoPerPeriod && (
                                    <PeriodsContainer directionRow={true}>
                                        {liveResultInfo?.scoreHomeByPeriod.map((homePeriodResult, index) => {
                                            return (
                                                <PeriodContainer key={index}>
                                                    <InfoLabel className="gray">{index + 1}</InfoLabel>
                                                    <InfoLabel>{homePeriodResult}</InfoLabel>
                                                    <InfoLabel>{liveResultInfo.scoreAwayByPeriod[index]}</InfoLabel>
                                                </PeriodContainer>
                                            );
                                        })}
                                        <PeriodContainer>
                                            <InfoLabel className="gray">T</InfoLabel>
                                            <InfoLabel>{liveResultInfo?.homeScore}</InfoLabel>
                                            <InfoLabel>{liveResultInfo?.awayScore}</InfoLabel>
                                        </PeriodContainer>
                                    </PeriodsContainer>
                                )}
                            </ResultContainer>
                        )}
                    </Status>
                )}
                <>
                    {isGameOpen && (
                        <ToggleContainer>
                            <Toggle
                                label={{
                                    firstLabel: t('markets.market-card.toggle.hide-paused-markets'),
                                    secondLabel: t('markets.market-card.toggle.show-paused-markets'),
                                }}
                                active={!hidePausedMarkets}
                                dotSize="18px"
                                dotBackground={theme.background.secondary}
                                dotBorder={`3px solid ${theme.borderColor.quaternary}`}
                                handleClick={() => {
                                    setHidePausedMarkets(!hidePausedMarkets);
                                }}
                            />
                        </ToggleContainer>
                    )}
                    <PositionsContainer>
                        <PositionsV2 markets={[market]} betType={BetType.WINNER} isGameOpen={isGameOpen} />
                        {Object.keys(groupedChildMarkets).map((key, index) => {
                            const typeId = Number(key);
                            const childMarkets = groupedChildMarkets[typeId];
                            return (
                                <PositionsV2
                                    key={index}
                                    markets={childMarkets}
                                    betType={typeId}
                                    isGameOpen={isGameOpen}
                                />
                            );
                        })}
                    </PositionsContainer>
                </>
                {/* <Transactions market={market} /> */}
                <TicketTransactions market={market} />
            </MainContainer>
            {isGameOpen && (
                <SidebarContainer>
                    <Parlay />
                </SidebarContainer>
            )}
            {isMobile && showParlayMobileModal && <ParlayMobileModal onClose={() => setShowParlayMobileModal(false)} />}
            {isMobile && <FooterSidebarMobile setParlayMobileVisibility={setShowParlayMobileModal} />}
        </RowContainer>
    );
};

const PositionsContainer = styled(FlexDivColumn)`
    position: relative;
    width: 100%;
    border-radius: 8px;
    margin-top: 10px;
    padding: 10px 10px 10px 10px;
    background-color: ${(props) => props.theme.oddsContainerBackground.secondary};
`;

const hideResultInfoPerPeriodForSports = (sportId: number) => {
    return (
        !SPORTS_TAGS_MAP['Soccer'].includes(Number(sportId)) &&
        !SPORTS_TAGS_MAP['eSports'].includes(sportId) &&
        !SPORTS_TAGS_MAP['MMA'].includes(sportId) &&
        !SPORTS_TAGS_MAP['Cricket'].includes(sportId) &&
        !SPORTS_TAGS_MAP['Motosport'].includes(sportId) &&
        sportId != 9399
    );
};

const getNetworkLogo = (networkId: number) => {
    switch (networkId) {
        case Network.OptimismMainnet:
            return <OPLogo />;
        case Network.Arbitrum:
            return <ArbitrumLogo />;
        default:
            return <></>;
    }
};

const RowContainer = styled(FlexDivRow)`
    margin-top: 40px;
    width: 100%;
    flex-direction: row;
    justify-content: center;
    @media (max-width: 575px) {
        margin-top: 30px;
    }
`;

const MainContainer = styled(FlexDivColumn)<{ isGameOpen: boolean }>`
    width: 100%;
    max-width: 900px;
    margin-right: ${(props) => (props.isGameOpen ? 10 : 0)}px;
    @media (max-width: 575px) {
        margin-right: 0;
    }
`;

const SidebarContainer = styled(FlexDivColumn)`
    max-width: 360px;
    @media (max-width: 1299px) {
        max-width: 320px;
    }
    @media (max-width: 950px) {
        display: none;
    }
`;

const HeaderWrapper = styled(FlexDivRow)`
    width: 100%;
    position: relative;
    align-items: center;
    @media (max-width: 950px) {
        flex-direction: column;
    }
`;

const IncentivizedLeague = styled.div`
    position: absolute;
    display: flex;
    align-items: center;
    cursor: pointer;
    right: 0;
    top: 0;
    @media (max-width: 950px) {
        position: static;
        margin-top: 20px;
    }
    svg {
        height: 25px;
    }
`;

const IncentivizedTitle = styled.span`
    font-size: 15px;
    padding-right: 5px;
`;

const Status = styled(FlexDivCentered)<{ backgroundColor?: string }>`
    width: 100%;
    border-radius: 8px;
    background-color: ${(props) => props.backgroundColor || props.theme.background.secondary};
    padding: 10px 50px;
    margin-bottom: 7px;
    font-weight: 600;
    font-size: 21px;
    line-height: 110%;
    text-transform: uppercase;
    color: ${(props) => props.theme.textColor.primary};
`;

const ResultContainer = styled(FlexDivColumnCentered)`
    align-items: center;
`;

const InfoLabel = styled.label`
    text-align: center;
    font-size: 18px;
    text-transform: uppercase;
    &.gray {
        color: ${(props) => props.theme.textColor.secondary};
    }

    &.red {
        color: ${(props) => props.theme.status.loss};
    }

    &.football {
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 21px;
        font-weight: 700;
    }
    &.ufc {
        display: flex;
        color: ${(props) => props.theme.textColor.secondary};
        font-size: 14px;
        font-weight: 700;
    }

    &.blink {
        color: ${(props) => props.theme.status.loss};
        font-weight: 700;
        animation: blinker 1.5s step-start infinite;
    }

    @keyframes blinker {
        50% {
            opacity: 0;
        }
    }
`;

const ResultLabel = styled.label`
    text-align: center;
`;

const PeriodContainer = styled(FlexDivColumn)`
    margin: 0px 10px;
    font-size: 18px;
`;

const PeriodsContainer = styled(FlexDivColumn)<{ directionRow?: boolean }>`
    margin-top: 10px;
    flex-direction: ${(props) => (props.directionRow ? 'row' : 'column')};
`;

export default MarketDetails;
