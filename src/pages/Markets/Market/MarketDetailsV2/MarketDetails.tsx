import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-logo.svg';
import { ReactComponent as OPLogo } from 'assets/images/optimism-logo.svg';
import { ReactComponent as ThalesLogo } from 'assets/images/thales-logo-small-white.svg';
import FooterSidebarMobile from 'components/FooterSidebarMobile';
import Tooltip from 'components/Tooltip';
import { INCENTIVIZED_GRAND_SLAM, INCENTIVIZED_LEAGUE } from 'constants/markets';
import ROUTES from 'constants/routes';
import { ENETPULSE_SPORTS, JSON_ODDS_SPORTS, SPORTS_TAGS_MAP, SPORT_PERIODS_MAP } from 'constants/tags';
import { GAME_STATUS } from 'constants/ui';
import Parlay from 'pages/Markets/Home/Parlay';
import ParlayMobileModal from 'pages/Markets/Home/Parlay/components/ParlayMobileModal';
import BackToLink from 'pages/Markets/components/BackToLink';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import React, { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { getNetworkId } from 'redux/modules/wallet';
import { RootState } from 'redux/rootReducer';
import styled, { useTheme } from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivColumnCentered, FlexDivRow } from 'styles/common';
import { SportMarketChildMarkets, SportMarketInfo, SportMarketLiveResult } from 'types/markets';
import { Network } from 'enums/network';
import { buildHref, navigateTo } from 'utils/routes';
import { getOrdinalNumberLabel } from 'utils/ui';
import Web3 from 'web3';
import Transactions from '../Transactions';
import CombinedPositions from './components/CombinedPositions';
import MatchInfo from './components/MatchInfo';
import Positions from './components/Positions';
import { BetType } from 'enums/markets';
import { ThemeInterface } from 'types/ui';

type MarketDetailsPropType = {
    market: SportMarketInfo;
};

const MarketDetails: React.FC<MarketDetailsPropType> = ({ market }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const networkId = useSelector((state: RootState) => getNetworkId(state));

    const [showParlayMobileModal, setShowParlayMobileModal] = useState(false);
    const lastValidChildMarkets: SportMarketChildMarkets = {
        spreadMarkets: market.childMarkets.filter((childMarket) => childMarket.betType == BetType.SPREAD),
        totalMarkets: market.childMarkets.filter((childMarket) => childMarket.betType == BetType.TOTAL),
        doubleChanceMarkets: market.childMarkets.filter((childMarket) => childMarket.betType == BetType.DOUBLE_CHANCE),
    };

    const combinedMarkets = market.combinedMarketsData ? market.combinedMarketsData : [];

    const isMounted = useRef(false);
    useEffect(() => {
        // skip first render
        if (isMounted.current) {
            navigateTo(ROUTES.Markets.Home);
        } else {
            isMounted.current = true;
        }
    }, [networkId]);

    const childMarkets: SportMarketChildMarkets = lastValidChildMarkets;

    const isGameStarted = market.maturityDate < new Date();
    const showAMM = !market.isResolved && !market.isCanceled && !isGameStarted && !market.isPaused;

    const isGameCancelled = market.isCanceled || (!isGameStarted && market.isResolved);
    const isGameResolved = market.isResolved || market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const isGamePaused = market.isPaused && !isGameResolved;
    const showStatus = market.isResolved || market.isCanceled || isGameStarted || market.isPaused;
    const gameIdString = Web3.utils.hexToAscii(market.gameId);
    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.tags[0]));
    const isJsonOddsSport = JSON_ODDS_SPORTS.includes(Number(market.tags[0]));
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];
    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);

    const useLiveResultQuery = useSportMarketLiveResultQuery(gameIdString, {
        enabled: isAppReady && !isEnetpulseSport && !isJsonOddsSport,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(gameIdString, gameDate, market.tags[0], {
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
            <MainContainer showAMM={showAMM}>
                <HeaderWrapper>
                    <BackToLink
                        link={buildHref(ROUTES.Markets.Home)}
                        text={t('market.back')}
                        customStylingContainer={{ position: 'absolute', left: 0, top: 0, marginTop: 0 }}
                    />
                    {INCENTIVIZED_LEAGUE.ids.includes(Number(market.tags[0])) &&
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
                                                networkId !== Network.ArbitrumOne
                                                    ? INCENTIVIZED_LEAGUE.opRewards
                                                    : INCENTIVIZED_LEAGUE.thalesRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {networkId !== Network.ArbitrumOne ? <OPLogo /> : <ThalesLogo />}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                    {INCENTIVIZED_GRAND_SLAM.ids.includes(Number(market.tags[0])) &&
                        new Date(market.maturityDate) > INCENTIVIZED_GRAND_SLAM.startDate &&
                        new Date(market.maturityDate) < INCENTIVIZED_GRAND_SLAM.endDate && (
                            <Tooltip
                                overlay={
                                    <Trans
                                        i18nKey="markets.incentivized-tooltip-tennis"
                                        components={{
                                            detailsLink: (
                                                <a
                                                    href={INCENTIVIZED_GRAND_SLAM.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                />
                                            ),
                                        }}
                                        values={{
                                            rewards:
                                                networkId !== Network.ArbitrumOne
                                                    ? INCENTIVIZED_GRAND_SLAM.opRewards
                                                    : INCENTIVIZED_GRAND_SLAM.arbRewards,
                                        }}
                                    />
                                }
                                component={
                                    <IncentivizedLeague>
                                        <IncentivizedTitle>{t('market.incentivized-market')}</IncentivizedTitle>
                                        {networkId !== Network.ArbitrumOne ? <OPLogo /> : <ArbitrumLogo />}
                                    </IncentivizedLeague>
                                }
                            ></Tooltip>
                        )}
                </HeaderWrapper>
                <MatchInfo market={market} liveResultInfo={liveResultInfo} isEnetpulseSport={isEnetpulseSport} />
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
                                        : `${market.homeScore} - ${market.awayScore}`}{' '}
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
                    <Positions markets={[market]} betType={BetType.WINNER} showOdds={showAMM} />
                    {childMarkets.doubleChanceMarkets.length > 0 && (
                        <Positions
                            markets={childMarkets.doubleChanceMarkets}
                            betType={BetType.DOUBLE_CHANCE}
                            areDoubleChanceMarkets
                            showOdds={showAMM}
                        />
                    )}
                    {childMarkets.spreadMarkets.length > 0 && (
                        <Positions markets={childMarkets.spreadMarkets} betType={BetType.SPREAD} showOdds={showAMM} />
                    )}
                    {childMarkets.totalMarkets.length > 0 && (
                        <Positions markets={childMarkets.totalMarkets} betType={BetType.TOTAL} showOdds={showAMM} />
                    )}
                    {combinedMarkets.length > 0 && <CombinedPositions combinedMarkets={combinedMarkets} />}
                </>
                <Transactions market={market} />
            </MainContainer>
            {showAMM && (
                <SidebarContainer>
                    <Parlay />
                </SidebarContainer>
            )}
            {isMobile && showParlayMobileModal && <ParlayMobileModal onClose={() => setShowParlayMobileModal(false)} />}
            {isMobile && <FooterSidebarMobile setParlayMobileVisibility={setShowParlayMobileModal} />}
        </RowContainer>
    );
};

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

const RowContainer = styled(FlexDivRow)`
    margin-top: 40px;
    width: 100%;
    flex-direction: row;
    justify-content: center;
    @media (max-width: 575px) {
        margin-top: 30px;
    }
`;

const MainContainer = styled(FlexDivColumn)<{ showAMM: boolean }>`
    width: 100%;
    max-width: 800px;
    margin-right: ${(props) => (props.showAMM ? 10 : 0)}px;
    @media (max-width: 575px) {
        margin-right: 0;
    }
`;

const SidebarContainer = styled(FlexDivColumn)`
    max-width: 320px;
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
    border-radius: 15px;
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

const ResultLabel = styled.label``;

const PeriodContainer = styled(FlexDivColumn)`
    margin: 0px 10px;
    font-size: 18px;
`;

const PeriodsContainer = styled(FlexDivColumn)<{ directionRow?: boolean }>`
    margin-top: 10px;
    flex-direction: ${(props) => (props.directionRow ? 'row' : 'column')};
`;

export default MarketDetails;
