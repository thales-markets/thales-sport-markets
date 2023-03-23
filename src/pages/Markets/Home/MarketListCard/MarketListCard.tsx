import SPAAnchor from 'components/SPAAnchor';
import TimeRemaining from 'components/TimeRemaining';
import Tooltip from 'components/Tooltip';
import { BetType, ENETPULSE_SPORTS, SPORTS_TAGS_MAP } from 'constants/tags';
import { t } from 'i18next';
import useEnetpulseAdditionalDataQuery from 'queries/markets/useEnetpulseAdditionalDataQuery';
import useSportMarketLiveResultQuery from 'queries/markets/useSportMarketLiveResultQuery';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady, getIsMobile } from 'redux/modules/app';
import { RootState } from 'redux/rootReducer';
import { SportMarketInfo, SportMarketLiveResult } from 'types/markets';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { getOnImageError, getTeamImageSource } from 'utils/images';
import { isFifaWCGame } from 'utils/markets';
import { buildMarketLink } from 'utils/routes';
import Web3 from 'web3';
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

    const doubleChanceMarkets = market.childMarkets.filter((market) => market.betType === BetType.DOUBLE_CHANCE);
    const spreadTotalMarkets = market.childMarkets.filter((market) => market.betType !== BetType.DOUBLE_CHANCE);
    const hasChildMarkets = doubleChanceMarkets.length > 0 || spreadTotalMarkets.length > 0;
    const isMaxNumberOfChildMarkets = market.childMarkets.length === MAX_NUMBER_OF_CHILD_MARKETS_ON_CONTRACT;
    const showSecondRowOnDesktop = !isMobile && isMaxNumberOfChildMarkets;
    const showSecondRowOnMobile = isMobile && hasChildMarkets;

    const useLiveResultQuery = useSportMarketLiveResultQuery(gameIdString, {
        enabled: isAppReady && isPendingResolution && !isEnetpulseSport,
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

    return (
        <Wrapper isResolved={isGameRegularlyResolved}>
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
                            component={
                                <MatchTimeLabel>
                                    {formatShortDateWithTime(market.maturityDate)}{' '}
                                    {isFifaWCGame(market.tags[0]) && (
                                        <Tooltip overlay={t(`common.fifa-tooltip`)} iconFontSize={12} marginLeft={2} />
                                    )}
                                </MatchTimeLabel>
                            }
                        />
                        <MatchTimeLabel>
                            {isEnetpulseSport && liveResultInfo ? (
                                <>
                                    {liveResultInfo.tournamentName ? '| ' + liveResultInfo.tournamentName : ''}
                                    {liveResultInfo.tournamentRound ? ' | ' + liveResultInfo.tournamentRound : ''}
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
                                    height={market.tags[0] == 9018 ? '17px' : ''}
                                    width={market.tags[0] == 9018 ? '27px' : ''}
                                    alt="Home team logo"
                                    src={homeLogoSrc}
                                    onError={getOnImageError(setHomeLogoSrc, market.tags[0])}
                                />
                                <VSLabel>VS</VSLabel>
                                <ClubLogo
                                    height={market.tags[0] == 9018 ? '17px' : ''}
                                    width={market.tags[0] == 9018 ? '27px' : ''}
                                    alt="Away team logo"
                                    src={awayLogoSrc}
                                    onError={getOnImageError(setAwayLogoSrc, market.tags[0])}
                                />
                            </TeamLogosConatiner>
                            <TeamNamesConatiner>
                                <TeamNameLabel>{market.homeTeam}</TeamNameLabel>
                                <TeamNameLabel>{market.awayTeam}</TeamNameLabel>
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
                                    <TotalMarkets>{MAX_NUMBER_OF_MARKETS}</TotalMarkets>
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
                        <ResultLabel>{t('markets.market-card.result')}:</ResultLabel>
                        <Result>{`${market.homeScore}:${market.awayScore}`}</Result>
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
                <SecondRowContainer mobilePaddingRight={isMaxNumberOfChildMarkets ? 4 : 20}>
                    <OddsWrapper>
                        {isMobile && doubleChanceMarkets.length > 0 && (
                            <Odds
                                market={doubleChanceMarkets[0]}
                                doubleChanceMarkets={doubleChanceMarkets}
                                isShownInSecondRow
                            />
                        )}
                        {spreadTotalMarkets.map((childMarket) => (
                            <Odds market={childMarket} key={childMarket.address} isShownInSecondRow />
                        ))}
                    </OddsWrapper>
                </SecondRowContainer>
            )}
        </Wrapper>
    );
};

export default MarketListCard;
