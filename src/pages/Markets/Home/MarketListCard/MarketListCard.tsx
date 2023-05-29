import SPAAnchor from 'components/SPAAnchor';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { BetType, ENETPULSE_SPORTS, FIFA_WC_TAG, FIFA_WC_U20_TAG, SPORTS_TAGS_MAP } from 'constants/tags';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { SportMarketInfo, SportMarketLiveResult } from 'types/markets';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { fixEnetpulseRacingName } from 'utils/formatters/string';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isUEFAGame, isFifaWCGame, isIIHFWCGame, isMotosport } from 'utils/markets';
import { buildMarketLink } from 'utils/routes';
import Web3 from 'web3';
import CombinedMarketsOdds from './components/CombinedMarketsOdds';
import MatchStatus from './components/MatchStatus';
import Odds from './components/Odds';
import {
    Arrow,
    ClubLogo,
    MainContainer,
    MatchInfoConatiner,
    MatchTimeLabel,
    OddsWrapper,
    Result,
    ResultLabel,
    ResultWrapper,
    SecondRowContainer,
    TeamLogosConatiner,
    TeamNameLabel,
    TeamNamesConatiner,
    TeamsInfoConatiner,
    ThirdRowContainer,
    TotalMarkets,
    TotalMarketsArrow,
    TotalMarketsContainer,
    TotalMarketsLabel,
    VSLabel,
    Wrapper,
} from './styled-components';

// 3 for double chance, 1 for spread, 1 for total
const MAX_NUMBER_OF_CHILD_MARKETS_ON_CONTRACT = 5;
// 1 for winner, 1 for double chance, 1 for spread, 1 for total
const MAX_NUMBER_OF_MARKETS = 4;

type MarketRowCardProps = {
    market: SportMarketInfo;
    language: string;
};

const MarketListCard: React.FC<MarketRowCardProps> = ({ market, language }) => {
    const { t } = useTranslation();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [homeLogoSrc, setHomeLogoSrc] = useState(getTeamImageSource(market.homeTeam, market.tags[0]));
    const [awayLogoSrc, setAwayLogoSrc] = useState(getTeamImageSource(market.awayTeam, market.tags[0]));

    const [liveResultInfo, setLiveResultInfo] = useState<SportMarketLiveResult | undefined>(undefined);

    useEffect(() => {
        setHomeLogoSrc(getTeamImageSource(market.homeTeam, market.tags[0]));
        setAwayLogoSrc(getTeamImageSource(market.awayTeam, market.tags[0]));
    }, [market.homeTeam, market.awayTeam, market.tags]);

    const isGameStarted = market.maturityDate < new Date();
    const isGameResolved = market.isResolved || market.isCanceled;
    const isGameRegularlyResolved = market.isResolved && !market.isCanceled;
    const isPendingResolution = isGameStarted && !isGameResolved;
    const showOdds = !isPendingResolution && !isGameResolved && !market.isPaused;
    const isEnetpulseSport = ENETPULSE_SPORTS.includes(Number(market.tags[0]));
    const gameIdString = Web3.utils.hexToAscii(market.gameId);
    const gameDate = new Date(market.maturityDate).toISOString().split('T')[0];

    const combinedMarketPositions = market.combinedMarketsData ? market.combinedMarketsData : [];

    const MAX_NUMBER_OF_MARKETS_COUNT = MAX_NUMBER_OF_MARKETS;

    const doubleChanceMarkets = market.childMarkets.filter((market) => market.betType === BetType.DOUBLE_CHANCE);
    const spreadTotalMarkets = market.childMarkets.filter((market) => market.betType !== BetType.DOUBLE_CHANCE);
    const hasChildMarkets = doubleChanceMarkets.length > 0 || spreadTotalMarkets.length > 0;
    const isMaxNumberOfChildMarkets =
        market.childMarkets.length === MAX_NUMBER_OF_CHILD_MARKETS_ON_CONTRACT ||
        market.childMarkets.length + combinedMarketPositions.length >= MAX_NUMBER_OF_CHILD_MARKETS_ON_CONTRACT;
    const showSecondRowOnDesktop = !isMobile && isMaxNumberOfChildMarkets;
    const showSecondRowOnMobile = isMobile && hasChildMarkets;

    const showOnlyCombinedPositionsInSecondRow =
        showSecondRowOnDesktop && !isMobile && !doubleChanceMarkets.length && combinedMarketPositions.length > 0;

    const hasCombinedMarkets = market.combinedMarketsData ? true : false;

    const useLiveResultQuery = useSportMarketLiveResultQuery(gameIdString, {
        enabled: isAppReady && isPendingResolution && !isEnetpulseSport,
    });

    const useEnetpulseLiveResultQuery = useEnetpulseAdditionalDataQuery(gameIdString, gameDate, market.tags[0], {
        enabled: isAppReady && isEnetpulseSport && (isPendingResolution || !localStorage.getItem(market.address)),
    });

    useEffect(() => {
        if (isEnetpulseSport) {
            if (useEnetpulseLiveResultQuery.isSuccess && useEnetpulseLiveResultQuery.data) {
                setLiveResultInfo(useEnetpulseLiveResultQuery.data);
                const tournamentName = useEnetpulseLiveResultQuery.data.tournamentName
                    ? market.isEnetpulseRacing
                        ? useEnetpulseLiveResultQuery.data.tournamentName
                        : '| ' + useEnetpulseLiveResultQuery.data.tournamentName
                    : '';
                const tournamentRound = useEnetpulseLiveResultQuery.data.tournamentRound
                    ? ' | ' + useEnetpulseLiveResultQuery.data.tournamentRound
                    : '';
                localStorage.setItem(market.address, tournamentName + tournamentRound);
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
        market.isEnetpulseRacing,
        market.address,
    ]);

    const areDoubleChanceMarketsOddsValid =
        doubleChanceMarkets && doubleChanceMarkets.length > 0
            ? doubleChanceMarkets.map((item) => item.homeOdds).every((odd) => odd < 1 && odd != 0)
            : false;

    const areSpreadTotalsMarketsOddsValid =
        spreadTotalMarkets && spreadTotalMarkets.length > 0
            ? spreadTotalMarkets
                  .map((item) => [item.homeOdds, item.awayOdds])
                  .every((oddsArray) => oddsArray[0] < 1 && oddsArray[0] != 0 && oddsArray[1] < 1 && oddsArray[1] != 0)
            : false;

    const areOddsValid = market.drawOdds
        ? [market.homeOdds, market.awayOdds, market.drawOdds].every((odd) => odd < 1 && odd != 0)
        : [market.homeOdds, market.awayOdds].every((odd) => odd < 1 && odd != 0);

    const hideGame =
        !areDoubleChanceMarketsOddsValid &&
        !areSpreadTotalsMarketsOddsValid &&
        !areOddsValid &&
        !isMotosport(Number(market.tags[0]));

    return (
        <Wrapper hideGame={hideGame} isResolved={isGameRegularlyResolved}>
            <MainContainer>
                <MatchInfoConatiner data-matomo-category="market-list-card" data-matomo-action="click-market-details">
                    <SPAAnchor href={buildMarketLink(market.address, language)}>
                        <Tooltip
                            overlay={
                                <>
                                    {t(`markets.market-card.starts-in`)}:{' '}
                                    <TimeRemaining end={market.maturityDate} fontSize={11} />
                                </>
                            }
                            component={<MatchTimeLabel>{formatShortDateWithTime(market.maturityDate)} </MatchTimeLabel>}
                        />
                        {isFifaWCGame(market.tags[0]) && (
                            <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={12} marginLeft={2} />
                        )}
                        {isIIHFWCGame(market.tags[0]) && (
                            <Tooltip overlay={t(`common.iihf-tooltip`)} iconFontSize={12} marginLeft={2} />
                        )}
                        {isUEFAGame(Number(market.tags[0])) && (
                            <Tooltip overlay={t(`common.uefa-tooltip`)} iconFontSize={12} marginLeft={2} />
                        )}
                        <MatchTimeLabel>
                            {isEnetpulseSport &&
                            !isFifaWCGame(market.tags[0]) &&
                            (liveResultInfo || localStorage.getItem(market.address)) ? (
                                <>
                                    {localStorage.getItem(market.address)}
                                    {SPORTS_TAGS_MAP['Tennis'].includes(Number(market.tags[0])) && (
                                        <Tooltip
                                            overlay={t(`common.tennis-tooltip`)}
                                            iconFontSize={12}
                                            marginLeft={2}
                                        />
                                    )}
                                </>
                            ) : (
                                ''
                            )}
                        </MatchTimeLabel>
                        <TeamsInfoConatiner>
                            <TeamLogosConatiner>
                                <ClubLogo
                                    height={
                                        market.tags[0] == FIFA_WC_TAG || market.tags[0] == FIFA_WC_U20_TAG ? '17px' : ''
                                    }
                                    width={
                                        market.tags[0] == FIFA_WC_TAG || market.tags[0] == FIFA_WC_U20_TAG ? '27px' : ''
                                    }
                                    alt="Home team logo"
                                    src={homeLogoSrc}
                                    onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                                />
                                {!market.isEnetpulseRacing && (
                                    <>
                                        <VSLabel>VS</VSLabel>
                                        <ClubLogo
                                            height={
                                                market.tags[0] == FIFA_WC_TAG || market.tags[0] == FIFA_WC_U20_TAG
                                                    ? '17px'
                                                    : ''
                                            }
                                            width={
                                                market.tags[0] == FIFA_WC_TAG || market.tags[0] == FIFA_WC_U20_TAG
                                                    ? '27px'
                                                    : ''
                                            }
                                            alt="Away team logo"
                                            src={awayLogoSrc}
                                            onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                                        />
                                    </>
                                )}
                            </TeamLogosConatiner>
                            <TeamNamesConatiner>
                                <TeamNameLabel>
                                    {market.isEnetpulseRacing
                                        ? fixEnetpulseRacingName(market.homeTeam)
                                        : market.homeTeam}
                                </TeamNameLabel>
                                {!market.isEnetpulseRacing && <TeamNameLabel>{market.awayTeam}</TeamNameLabel>}
                            </TeamNamesConatiner>
                        </TeamsInfoConatiner>
                    </SPAAnchor>
                </MatchInfoConatiner>
                <OddsWrapper>
                    {showOdds && (
                        <>
                            <Odds market={market} />
                            {!isMobile && (
                                <>
                                    {doubleChanceMarkets.length > 0 && (
                                        <Odds
                                            market={doubleChanceMarkets[0]}
                                            doubleChanceMarkets={doubleChanceMarkets}
                                        />
                                    )}
                                    {!showSecondRowOnDesktop &&
                                        spreadTotalMarkets.map((childMarket) => (
                                            <Odds market={childMarket} key={childMarket.address} />
                                        ))}
                                    {showOnlyCombinedPositionsInSecondRow &&
                                        spreadTotalMarkets.map((childMarket) => (
                                            <Odds market={childMarket} key={childMarket.address} />
                                        ))}
                                </>
                            )}
                            {showSecondRowOnMobile && (
                                <Arrow
                                    className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                                    onClick={() => setIsExpanded(!isExpanded)}
                                />
                            )}
                            {showSecondRowOnDesktop && (
                                <TotalMarketsContainer>
                                    <TotalMarketsLabel>{t('markets.market-card.total-markets')}</TotalMarketsLabel>
                                    <TotalMarkets>{MAX_NUMBER_OF_MARKETS_COUNT}</TotalMarkets>
                                    <TotalMarketsArrow
                                        className={isExpanded ? 'icon icon--arrow-up' : 'icon icon--arrow-down'}
                                        onClick={() => setIsExpanded(!isExpanded)}
                                    />
                                </TotalMarketsContainer>
                            )}
                        </>
                    )}
                </OddsWrapper>
                {isGameRegularlyResolved ? (
                    <ResultWrapper>
                        <ResultLabel>
                            {!market.isEnetpulseRacing ? `${t('markets.market-card.result')}:` : ''}
                        </ResultLabel>
                        <Result>
                            {market.isEnetpulseRacing
                                ? market.homeScore == 1
                                    ? t('markets.market-card.race-winner')
                                    : t('markets.market-card.no-win')
                                : `${market.homeScore} - ${market.awayScore}`}
                        </Result>
                    </ResultWrapper>
                ) : (
                    <MatchStatus
                        isPendingResolution={isPendingResolution}
                        liveResultInfo={liveResultInfo}
                        isCanceled={market.isCanceled}
                        isPaused={market.isPaused}
                        isEnetpulseSport={isEnetpulseSport}
                    />
                )}
            </MainContainer>
            {(showSecondRowOnMobile || showSecondRowOnDesktop) && showOdds && isExpanded && (
                <>
                    <SecondRowContainer mobilePaddingRight={isMaxNumberOfChildMarkets ? 4 : 20}>
                        <OddsWrapper>
                            {isMobile && doubleChanceMarkets.length > 0 && (
                                <Odds
                                    market={doubleChanceMarkets[0]}
                                    doubleChanceMarkets={doubleChanceMarkets}
                                    isShownInSecondRow
                                />
                            )}
                            {!showOnlyCombinedPositionsInSecondRow &&
                                spreadTotalMarkets.map((childMarket) => (
                                    <Odds market={childMarket} key={childMarket.address} isShownInSecondRow />
                                ))}
                            {hasCombinedMarkets && !isMobile && showOnlyCombinedPositionsInSecondRow && (
                                <CombinedMarketsOdds market={market} />
                            )}
                        </OddsWrapper>
                    </SecondRowContainer>
                    {isMobile && hasCombinedMarkets && (
                        <ThirdRowContainer mobilePaddingRight={isMaxNumberOfChildMarkets ? 4 : 20}>
                            <OddsWrapper>
                                <CombinedMarketsOdds market={market} />
                            </OddsWrapper>
                        </ThirdRowContainer>
                    )}
                </>
            )}
        </Wrapper>
    );
};

export default MarketListCard;
